'use client';

// 참조 이미지 슬롯 관리 UI — Settings 페이지에 마운트된다.
// 5개 슬롯 그리드, 빈 슬롯에서만 업로드 가능. 5개 꽉 차면 업로드 비활성화.

import { Loader2, Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useDeleteReferenceImage,
  useReferenceImages,
  useUploadReferenceImage,
} from '@/features/references/hooks/useReferenceImages';

import type { ReferenceImageSlot } from '@/types/domain';

const SLOT_COUNT = 5;

export function ReferenceImagesSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useReferenceImages();
  const upload = useUploadReferenceImage();
  const remove = useDeleteReferenceImage();

  const slots = data?.slots ?? [];
  const isFull = slots.length >= SLOT_COUNT;

  const emptyCells = Array.from({ length: Math.max(0, SLOT_COUNT - slots.length) });

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      await upload.mutateAsync(file);
      toast.success('참조 이미지를 저장했어요');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '업로드 실패');
    }
  }

  async function onDelete(slot: ReferenceImageSlot) {
    setPendingDeleteId(slot.id);
    try {
      await remove.mutateAsync(slot.id);
      toast.success('참조 이미지를 삭제했어요');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제 실패');
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>참조 이미지 슬롯</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          이미지 생성 시 첨부해서 사용할 참조 이미지를 미리 저장해두세요. 계정당 최대{' '}
          <span className="font-semibold">{SLOT_COUNT}개</span>까지 보관할 수 있어요.
        </p>
        <p className="text-xs text-muted-foreground">
          되도록 4MB 이하를 넣어주세요, 초과 시 리사이즈 됩니다. (JPG → PNG, 초과 시 리사이즈)
        </p>

        {isError ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            <p>참조 이미지를 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-xs text-primary underline-offset-4 hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {isLoading
              ? Array.from({ length: SLOT_COUNT }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="aspect-square animate-pulse rounded-md bg-muted"
                    aria-hidden="true"
                  />
                ))
              : slots.map((slot) => {
                  const deleting = pendingDeleteId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slot.url}
                        alt={slot.filename ?? '참조 이미지'}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => onDelete(slot)}
                        disabled={deleting}
                        aria-label="참조 이미지 삭제"
                        className={cn(
                          'absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-md transition-opacity',
                          'opacity-0 focus:opacity-100 group-hover:opacity-100',
                          deleting && 'opacity-100',
                        )}
                      >
                        {deleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  );
                })}

            {!isLoading &&
              emptyCells.map((_, i) => {
                const isFirstEmpty = i === 0;
                if (isFirstEmpty && !isFull) {
                  return (
                    <button
                      key={`empty-${i}`}
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={upload.isPending}
                      className={cn(
                        'flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors',
                        'hover:border-primary hover:bg-primary/5 hover:text-primary',
                        upload.isPending && 'cursor-wait opacity-70',
                      )}
                    >
                      {upload.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          <span className="text-xs">이미지 추가</span>
                        </>
                      )}
                    </button>
                  );
                }
                return (
                  <div
                    key={`empty-${i}`}
                    className="flex aspect-square items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground/60"
                  >
                    빈 슬롯
                  </div>
                );
              })}
          </div>
        )}

        {isFull && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            슬롯이 가득 찼어요. 새로 저장하려면 기존 이미지를 하나 삭제해주세요.
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/heic,image/heif"
          onChange={onPickFile}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
