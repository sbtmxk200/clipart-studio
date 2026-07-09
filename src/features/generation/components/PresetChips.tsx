'use client';

// Design Ref: §5.4 Chaining Page — Preset Chips: 원클릭 프롬프트 자동 변형
// 클릭하면 " · <hint>"가 프롬프트 끝에 append되며 중복 클릭 시 제거(toggle)됩니다.

import { cn } from '@/lib/utils';

// Design §5.4의 예시: [다른 포즈] [다른 표정] [겨울옷] [뛰는 모습] [계절 버전]
export const PRESET_CHIPS = [
  { label: '다른 포즈', hint: '다른 포즈로' },
  { label: '다른 표정', hint: '다른 표정으로' },
  { label: '겨울옷', hint: '겨울옷 차림' },
  { label: '뛰는 모습', hint: '뛰는 모습' },
  { label: '계절 버전', hint: '다른 계절 버전' },
] as const;

const HINT_SEP = ' · ';

interface PresetChipsProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}

function hasHint(prompt: string, hint: string): boolean {
  return prompt.includes(`${HINT_SEP}${hint}`) || prompt.endsWith(hint);
}

function toggleHint(prompt: string, hint: string): string {
  if (hasHint(prompt, hint)) {
    // Remove the ' · <hint>' segment (or the trailing ' <hint>' at end)
    return prompt
      .replace(`${HINT_SEP}${hint}`, '')
      .replace(new RegExp(`\\s*${hint}$`), '')
      .trim();
  }
  const base = prompt.trim();
  return base ? `${base}${HINT_SEP}${hint}` : hint;
}

export function PresetChips({ value, onChange, disabled }: PresetChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_CHIPS.map((chip) => {
        const active = hasHint(value, chip.hint);
        return (
          <button
            key={chip.hint}
            type="button"
            disabled={disabled}
            onClick={() => onChange(toggleHint(value, chip.hint))}
            className={cn(
              'h-7 rounded-full border px-3 text-xs transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-accent',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
