// Design Ref: §7.2 Credit Integrity Pattern — atomic RPC calls only
// NEVER compute credits = credits - N in application code (race condition).

import { createSupabaseServiceClient } from '@/services/supabase/server';

export class InsufficientCreditsError extends Error {
  constructor() {
    super('INSUFFICIENT_CREDITS');
    this.name = 'InsufficientCreditsError';
  }
}

export async function reserveCredits(userId: string, amount: number): Promise<number> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc('reserve_credits', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    if (error.message.includes('INSUFFICIENT_CREDITS')) {
      throw new InsufficientCreditsError();
    }
    throw error;
  }
  return data as number;
}

export async function refundCredits(userId: string, amount: number): Promise<number> {
  if (amount <= 0) return 0;
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.rpc('refund_credits', {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) throw error;
  return data as number;
}
