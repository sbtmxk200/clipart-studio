'use client';

// Design Ref: §5.4 Generation Page checklist — prompt, batch size, diversity, school toggle, submit
// Plan SC: FR-05 batch request, FR-06 diversity, FR-17 school profile injection

import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateJob, CreateJobError } from '@/features/generation/hooks/useCreateJob';
import { SchoolStyleToggle } from '@/features/generation/components/SchoolStyleToggle';
import { useAuthStore } from '@/lib/store/authStore';
import { useGenerationStore } from '@/lib/store/generationStore';
import { cn } from '@/lib/utils';
import { BATCH_SIZES } from '@/types/domain';
import { createJobSchema } from '@/types/schemas';

import type { BatchSize } from '@/types/domain';
import type { FormEvent } from 'react';

interface GenerationFormProps {
  hasSchoolProfile: boolean;
  schoolName: string | null;
  initialCredits: number;
}

export function GenerationForm({
  hasSchoolProfile,
  schoolName,
  initialCredits,
}: GenerationFormProps) {
  const storeCredits = useAuthStore((s) => s.profile?.credits);
  const credits = storeCredits ?? initialCredits;
  const streamStatus = useGenerationStore((s) => s.streamStatus);
  const inFlight = streamStatus === 'starting' || streamStatus === 'streaming';

  const [prompt, setPrompt] = useState('');
  const [batchSize, setBatchSize] = useState<BatchSize>(5);
  const [diversityLevel, setDiversityLevel] = useState(0);
  const [schoolProfileApplied, setSchoolProfileApplied] = useState(hasSchoolProfile);

  const createJob = useCreateJob();

  const insufficient = credits < batchSize;
  const disabled = inFlight || insufficient || !prompt.trim() || createJob.isPending;

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createJobSchema.safeParse({
      prompt,
      batchSize,
      diversityLevel,
      referenceImageId: null,
      schoolProfileApplied,
      generationMode: 'text2img',
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? '입력값을 확인해주세요');
      return;
    }

    try {
      await createJob.mutateAsync(parsed.data);
    } catch (err) {
      if (err instanceof CreateJobError) {
        if (err.code === 'INSUFFICIENT_CREDITS') {
          toast.error('크레딧이 부족합니다. 프로필 페이지에서 리셋일을 확인해주세요.');
        } else if (err.code === 'ACTIVE_JOB_EXISTS') {
          toast.error('이전 생성이 아직 진행 중입니다.');
        } else {
          toast.error(err.message);
        }
        return;
      }
      toast.error('요청 중 문제가 발생했습니다');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          AI 이미지 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="prompt">프롬프트</Label>
            <Textarea
              id="prompt"
              rows={3}
              placeholder="예: 이순신 장군이 갑옷을 입고 서 있는 모습"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={inFlight}
            />
          </div>

          <SchoolStyleToggle
            hasSchoolProfile={hasSchoolProfile}
            schoolName={schoolName}
            checked={schoolProfileApplied}
            onChange={setSchoolProfileApplied}
          />

          <div className="space-y-2">
            <Label>배치 크기</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {BATCH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={inFlight}
                  onClick={() => setBatchSize(size)}
                  className={cn(
                    'h-9 rounded-md border text-sm font-medium transition-colors',
                    batchSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-background hover:bg-accent',
                    inFlight && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              5장 단위 청크로 병렬 생성됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label>다양성 강화</Label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Math.min(6, Math.floor(batchSize / 5))}
                step={1}
                value={diversityLevel}
                disabled={inFlight}
                onChange={(e) => setDiversityLevel(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-16 text-right text-sm tabular-nums">
                {diversityLevel === 0 ? '기본' : `앞 ${diversityLevel * 5}장`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              선택한 청크 수만큼 스타일/구도 힌트를 추가로 주입합니다.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 p-3">
            <div className="text-sm">
              <div>
                보유 크레딧: <span className="font-semibold tabular-nums">{credits}</span>
              </div>
              <div className="text-muted-foreground">
                이번 요청: <span className="tabular-nums">-{batchSize}</span>
                {' → '}
                남게 될 잔액:{' '}
                <span className="tabular-nums">{Math.max(0, credits - batchSize)}</span>
              </div>
            </div>
            <Button type="submit" disabled={disabled} className="min-w-[10rem]">
              {inFlight
                ? '생성 중…'
                : insufficient
                  ? '크레딧 부족'
                  : `생성 시작 (-${batchSize})`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
