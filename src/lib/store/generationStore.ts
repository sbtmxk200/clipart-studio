// Design Ref: §9.4 Application layer — client-side generation state (Zustand)
// Design Ref: §2.2 Batch generation data flow (SSE consumer targets this store)

import { create } from 'zustand';

export type ResultCardStatus = 'pending' | 'saved' | 'discarded';

export interface ResultCard {
  order: number;
  imageId: string;
  thumbnailUrl: string;
  status: ResultCardStatus;
}

export interface ChunkFailure {
  order: number;
  error: string;
}

export interface DoneSummary {
  completed: number;
  failed: number;
  refundedCredits: number;
  finalRemainingCredits: number | null;
}

export type StreamStatus = 'idle' | 'starting' | 'streaming' | 'done' | 'error';

type GenerationState = {
  jobId: string | null;
  batchSize: number;
  streamStatus: StreamStatus;
  cards: ResultCard[];
  failures: ChunkFailure[];
  summary: DoneSummary | null;
  errorMessage: string | null;

  startJob: (jobId: string, batchSize: number) => void;
  markStreaming: () => void;
  appendCard: (card: Omit<ResultCard, 'status'>) => void;
  appendFailure: (failure: ChunkFailure) => void;
  finish: (summary: DoneSummary) => void;
  fail: (message: string) => void;
  updateCardStatus: (imageId: string, status: ResultCardStatus) => void;
  reset: () => void;
};

const initial = {
  jobId: null,
  batchSize: 0,
  streamStatus: 'idle' as StreamStatus,
  cards: [] as ResultCard[],
  failures: [] as ChunkFailure[],
  summary: null as DoneSummary | null,
  errorMessage: null as string | null,
};

export const useGenerationStore = create<GenerationState>((set) => ({
  ...initial,
  startJob: (jobId, batchSize) =>
    set({
      ...initial,
      jobId,
      batchSize,
      streamStatus: 'starting',
    }),
  markStreaming: () => set({ streamStatus: 'streaming' }),
  appendCard: (card) =>
    set((state) => {
      const next: ResultCard = { ...card, status: 'pending' };
      return {
        cards: [...state.cards, next].sort((a, b) => a.order - b.order),
      };
    }),
  appendFailure: (failure) =>
    set((state) => ({ failures: [...state.failures, failure] })),
  finish: (summary) => set({ streamStatus: 'done', summary }),
  fail: (message) => set({ streamStatus: 'error', errorMessage: message }),
  updateCardStatus: (imageId, status) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.imageId === imageId ? { ...c, status } : c)),
    })),
  reset: () => set(initial),
}));

export const selectPendingCount = (state: GenerationState) =>
  state.cards.filter((c) => c.status === 'pending').length;
