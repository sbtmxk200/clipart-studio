'use client';

// Design Ref: §4.2 GET /api/jobs/:id/stream — SSE consumer
// Design Ref: §6.2 SSE error handling via event channel
// Plan SC: FR-20 SSE streaming

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/authStore';
import { useGenerationStore } from '@/lib/store/generationStore';

interface ImageReadyEvent {
  imageId: string;
  thumbnailUrl: string;
  order: number;
}

interface ChunkFailedEvent {
  order: number;
  error: string;
  refundedCredits: number;
}

interface DoneEvent {
  jobId: string;
  completed: number;
  failed: number;
  refundedCredits: number;
  finalRemainingCredits: number | null;
}

export function useJobStream(jobId: string | null) {
  const queryClient = useQueryClient();
  const markStreaming = useGenerationStore((s) => s.markStreaming);
  const appendCard = useGenerationStore((s) => s.appendCard);
  const appendFailure = useGenerationStore((s) => s.appendFailure);
  const finish = useGenerationStore((s) => s.finish);
  const fail = useGenerationStore((s) => s.fail);
  const updateStoreCredits = useAuthStore((s) => s.updateCredits);

  useEffect(() => {
    if (!jobId) return;

    const source = new EventSource(`/api/jobs/${jobId}/stream`);
    markStreaming();

    source.addEventListener('image_ready', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as ImageReadyEvent;
      appendCard({
        imageId: data.imageId,
        thumbnailUrl: data.thumbnailUrl,
        order: data.order,
      });
    });

    source.addEventListener('chunk_failed', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as ChunkFailedEvent;
      appendFailure({ order: data.order, error: data.error });
      updateStoreCredits(useAuthStore.getState().profile?.credits ?? 0);
      toast.warning(`이미지 ${data.order + 1}번 실패`, {
        description: data.error,
      });
    });

    source.addEventListener('done', (event) => {
      const data = JSON.parse((event as MessageEvent).data) as DoneEvent;
      finish({
        completed: data.completed,
        failed: data.failed,
        refundedCredits: data.refundedCredits,
        finalRemainingCredits: data.finalRemainingCredits,
      });
      if (data.finalRemainingCredits !== null) {
        updateStoreCredits(data.finalRemainingCredits);
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', data.jobId] });
      source.close();
    });

    source.onerror = () => {
      const state = useGenerationStore.getState();
      if (state.streamStatus === 'done') return;
      fail('스트림 연결이 끊어졌습니다');
      toast.error('실시간 연결 오류. 페이지를 새로고침해주세요.');
      source.close();
    };

    return () => {
      source.close();
    };
  }, [jobId, markStreaming, appendCard, appendFailure, finish, fail, queryClient, updateStoreCredits]);
}
