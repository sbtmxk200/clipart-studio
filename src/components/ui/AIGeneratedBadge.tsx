// Design Ref: §7 Security — mandatory "AI 생성" label on all image details
// Plan SC: FR-18 AI generated label required

import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

export function AIGeneratedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary',
        className,
      )}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      AI 생성
    </span>
  );
}
