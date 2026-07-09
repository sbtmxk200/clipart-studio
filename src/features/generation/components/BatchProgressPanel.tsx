'use client';

// Design Ref: §5.4 Batch Progress Panel — progress bar + card stream + done banner
// Design Ref: §2.2 SSE consumer wiring (useJobStream drives store, panel renders)
// Plan SC: FR-20 SSE UI reflection

import { CheckCircle2, ImageIcon, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultCard } from '@/features/generation/components/ResultCard';
import { useJobStream } from '@/features/generation/hooks/useJobStream';
import { useGenerationStore } from '@/lib/store/generationStore';
import { cn } from '@/lib/utils';

export function BatchProgressPanel() {
  const jobId = useGenerationStore((s) => s.jobId);
  const batchSize = useGenerationStore((s) => s.batchSize);
  const cards = useGenerationStore((s) => s.cards);
  const failures = useGenerationStore((s) => s.failures);
  const streamStatus = useGenerationStore((s) => s.streamStatus);
  const summary = useGenerationStore((s) => s.summary);
  const errorMessage = useGenerationStore((s) => s.errorMessage);
  const reset = useGenerationStore((s) => s.reset);

  useJobStream(jobId);

  if (streamStatus === 'idle') {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <ImageIcon className="mb-3 h-8 w-8" aria-hidden="true" />
          <p className="text-sm">결과가 이 영역에 표시됩니다</p>
        </CardContent>
      </Card>
    );
  }

  const total = batchSize;
  const finished = cards.length + failures.length;
  const percent = total > 0 ? Math.min(100, Math.round((finished / total) * 100)) : 0;
  const isStreaming = streamStatus === 'starting' || streamStatus === 'streaming';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
            {isStreaming ? '생성 중' : streamStatus === 'error' ? '오류' : '완료'}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              {cards.length}/{total}
              {failures.length > 0 && ` · 실패 ${failures.length}`}
            </span>
          </CardTitle>
          {streamStatus !== 'starting' && streamStatus !== 'streaming' && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              새 생성 시작
            </button>
          )}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full bg-primary transition-all duration-300',
              streamStatus === 'error' && 'bg-destructive',
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {summary && (
          <div
            className={cn(
              'rounded-md border p-3 text-sm',
              summary.failed === 0
                ? 'border-primary/40 bg-primary/5'
                : 'border-amber-500/40 bg-amber-500/5',
            )}
          >
            완료: <span className="font-semibold">{summary.completed}</span> / {total}
            {summary.failed > 0 && (
              <>
                {' · 실패 '}
                <span className="font-semibold">{summary.failed}</span>
                {' · 환불 '}
                <span className="font-semibold">{summary.refundedCredits}</span> 크레딧
              </>
            )}
            {summary.finalRemainingCredits !== null && (
              <>
                {' · 잔액 '}
                <span className="font-semibold tabular-nums">
                  {summary.finalRemainingCredits}
                </span>
              </>
            )}
          </div>
        )}

        {streamStatus === 'error' && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {errorMessage ?? '알 수 없는 오류'}
          </div>
        )}

        {cards.length === 0 && isStreaming ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: Math.min(5, total) }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-muted"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <ResultCard key={card.imageId} card={card} />
            ))}
          </div>
        )}

        {isStreaming && cards.length > 0 && cards.length < total && (
          <p className="text-center text-xs text-muted-foreground">
            남은 이미지를 생성하고 있어요…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
