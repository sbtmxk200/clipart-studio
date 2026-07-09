// Design Ref: §5.4 Batch Progress Panel — card action [저장] [삭제]
// Plan SC: FR-08 pending→saved transition, FR-11 24h pending TTL exit via manual save/discard
// Transitions allowed: pending → saved | discarded. RLS enforces owner-only UPDATE.

import { z } from 'zod';
import { ZodError } from 'zod';

import { apiError, apiOk } from '@/lib/api-error';
import { createSupabaseServerClient } from '@/services/supabase/server';

const bodySchema = z.object({
  status: z.enum(['saved', 'discarded']),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    if (err instanceof ZodError) {
      return apiError('VALIDATION_ERROR', '입력값을 확인해주세요', {
        fieldErrors: err.flatten().fieldErrors,
      });
    }
    return apiError('VALIDATION_ERROR', '요청 형식이 올바르지 않습니다');
  }

  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError || !image) {
    return apiError('NOT_FOUND', '이미지를 찾을 수 없습니다');
  }

  if (image.status !== 'pending') {
    return apiError('VALIDATION_ERROR', 'pending 상태의 이미지만 변경할 수 있습니다', {
      currentStatus: image.status,
    });
  }

  const update: Record<string, unknown> = { status: body.status };
  // Clear the TTL once the image is out of pending — either saved (permanent) or discarded (cleanup owns it)
  update.pending_expires_at = null;

  const { error: updateError } = await supabase
    .from('images')
    .update(update)
    .eq('id', params.id);

  if (updateError) {
    return apiError('INTERNAL_ERROR', '상태 변경 실패');
  }

  return apiOk({ id: params.id, status: body.status });
}
