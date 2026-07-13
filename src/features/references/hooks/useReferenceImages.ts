'use client';

// 참조 이미지 슬롯 훅 — Settings의 관리 UI와 Generation의 선택 UI가 공유한다.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ReferenceImageSlot } from '@/types/domain';

interface ListResponse {
  slots: ReferenceImageSlot[];
  limit: number;
}

const QUERY_KEY = ['reference-images'] as const;

async function fetchList(): Promise<ListResponse> {
  const res = await fetch('/api/references', { cache: 'no-store' });
  if (!res.ok) throw new Error('참조 이미지를 불러오지 못했어요');
  const json = (await res.json()) as { data: ListResponse };
  return json.data;
}

export function useReferenceImages() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchList,
    staleTime: 30_000,
  });
}

export function useUploadReferenceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/references', { method: 'POST', body: form });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(json?.error?.message ?? '업로드에 실패했어요');
      }
      const json = (await res.json()) as { data: { slot: ReferenceImageSlot } };
      return json.data.slot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteReferenceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/references/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(json?.error?.message ?? '삭제에 실패했어요');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
