'use client';

// Design Ref: §5.4 Onboarding — first-visit walkthrough on the home surface.
// Storage: localStorage flag (client-only) so we don't add a DB column just for
// "seen tutorial". The trade-off is a fresh tutorial on a new browser/device,
// which is acceptable for MVP.

import { ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'clipart_tutorial_completed_v1';

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '필요한 이미지를 먼저 찾아보세요',
    body: `원하는 키워드를 검색하면 이미 만들어진 이미지를 먼저 보여드립니다.

찾는 이미지가 있다면 바로 사용할 수 있어 시간을 아낄 수 있습니다.`,
  },
  {
    title: '원하는 이미지가 없다면 직접 만들어 보세요',
    body: `찾는 이미지가 없다면 AI가 새롭게 만들어 드립니다.

원하는 내용을 입력하면 여러 장을 만들어 드리니, 가장 마음에 드는 이미지를 선택해 보세요.`,
  },
  {
    title: '마음에 드는 이미지는 저장해 두세요',
    body: `저장한 이미지는 언제든 다시 사용할 수 있는 나만의 라이브러리가 됩니다.

원한다면 다른 사용자와 공유할 수도 있습니다.`,
  },
  {
    title: '같은 스타일로 이어서 만들어 보세요',
    body: `마음에 드는 이미지를 선택한 뒤 [이 이미지로 다시 만들기]를 누르면

캐릭터나 스타일은 유지하면서 다른 포즈, 표정, 계절 버전 등을 쉽게 만들 수 있습니다.`,
  },
];

export function TutorialOverlay() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  function complete() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              시작하기 · {step + 1}/{STEPS.length}
            </p>
            <h2 id="tutorial-title" className="text-lg font-semibold">
              {current.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={complete}
            className="rounded p-1 text-muted-foreground hover:bg-accent"
            aria-label="닫기"
            title="건너뛰기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
          {current.body}
        </p>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted',
              )}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={complete}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            건너뛰기
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                이전
              </Button>
            )}
            {isLast ? (
              <Button type="button" size="sm" onClick={complete}>
                시작하기
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                다음
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
