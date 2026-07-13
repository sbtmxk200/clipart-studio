// 참조 이미지 슬롯 삭제 — DB row와 R2 객체를 함께 지운다.

export const runtime = 'nodejs';
export const maxDuration = 15;

import { apiError, apiOk } from '@/lib/api-error';
import { deleteObject } from '@/services/r2/upload';
import { createSupabaseServerClient } from '@/services/supabase/server';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  // RLS가 다른 사용자 것을 못 보게 막지만 응답 코드를 정확히 주려고 조회 먼저.
  const { data: row } = await supabase
    .from('reference_images')
    .select('id, r2_key')
    .eq('id', params.id)
    .maybeSingle();

  if (!row) return apiError('NOT_FOUND', '참조 이미지를 찾을 수 없어요');

  const { error: delError } = await supabase
    .from('reference_images')
    .delete()
    .eq('id', params.id);

  if (delError) {
    return apiError('INTERNAL_ERROR', '참조 이미지 삭제 실패');
  }

  // R2 객체는 best-effort. 실패해도 DB row는 이미 지웠으므로 응답은 성공.
  await deleteObject(row.r2_key as string).catch((err) => {
    console.error('[references] R2 delete failed', err);
  });

  return apiOk({ id: params.id });
}
