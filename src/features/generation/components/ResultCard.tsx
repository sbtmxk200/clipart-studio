'use client';

// Design Ref: §5.4 Batch Progress Panel — card action [저장] [폐기]
// Non-Negotiable Rule 3 (CLAUDE.md): AI 라벨은 이미지 상세에서 필수 (Module 6 detail page). 여기 카드 배지도 함께 표기.

import { Check, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AIGeneratedBadge } from '@/components/ui/AIGeneratedBadge';
import { Button } from '@/components/ui/button';
import { useGenerationStore } from '@/lib/store/generationStore';
import { cn } from '@/lib/utils';

import type { ResultCard as ResultCardModel } from '@/lib/store/generationStore';

async function patchStatus(imageId: string, status: 'saved' | 'discarded') {
  const res = await fetch(`/api/images/${imageId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(json?.error?.message ?? '상태 변경 실패');
  }
}

export function ResultCard({ card }: { card: ResultCardModel }) {
  const [busy, setBusy] = useState<'saved' | 'discarded' | null>(null);
  const updateCardStatus = useGenerationStore((s) => s.updateCardStatus);

  async function handle(action: 'saved' | 'discarded') {
    if (card.status !== 'pending' || busy) return;
    setBusy(action);
    try {
      await patchStatus(card.imageId, action);
      updateCardStatus(card.imageId, action);
      toast.success(action === 'saved' ? '라이브러리에 저장했습니다' : '폐기했습니다');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '요청 실패');
    } finally {
      setBusy(null);
    }
  }

  const isDone = card.status !== 'pending';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-opacity card-fade-in',
        card.status === 'discarded' && 'opacity-40',
      )}
    >
      <div className="relative aspect-square w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.thumbnailUrl}
          alt={`생성 결과 ${card.order + 1}번`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute right-2 top-2">
          <AIGeneratedBadge />
        </div>
        {card.status === 'saved' && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              <Check className="mr-1 inline h-3 w-3" /> 저장됨
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-2">
        <span className="text-xs text-muted-foreground tabular-nums">#{card.order + 1}</span>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={card.status === 'saved' ? 'secondary' : 'default'}
            disabled={isDone || !!busy}
            onClick={() => handle('saved')}
          >
            {busy === 'saved' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              '저장'
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isDone || !!busy}
            onClick={() => handle('discarded')}
            aria-label="폐기"
          >
            {busy === 'discarded' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
