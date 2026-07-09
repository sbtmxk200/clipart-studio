'use client';

// Design Ref: §5.3 CreditBadge — header credit balance display
// Plan SC: FR-12 credit UI

import { Coins } from 'lucide-react';

function formatResetDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export function CreditBadge({
  credits,
  creditsResetAt,
}: {
  credits: number;
  creditsResetAt: string | null;
}) {
  const resetLabel = formatResetDate(creditsResetAt);
  const title = resetLabel ? `다음 리셋: ${resetLabel}` : '이번 달 크레딧';

  return (
    <div
      title={title}
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium"
    >
      <Coins className="h-4 w-4" aria-hidden="true" />
      <span>{credits}</span>
    </div>
  );
}
