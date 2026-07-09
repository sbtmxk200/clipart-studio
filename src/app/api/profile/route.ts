// Design Ref: §4.1 GET/PUT /api/profile
// Plan SC: FR-02 Profile CRUD

import { ZodError } from 'zod';

import { apiError, apiOk } from '@/lib/api-error';
import { createSupabaseServerClient } from '@/services/supabase/server';
import { updateProfileSchema } from '@/types/schemas';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) return apiError('NOT_FOUND', '프로필을 찾을 수 없습니다');
  return apiOk(data);
}

export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  try {
    const body = updateProfileSchema.parse(await request.json());
    const update: Record<string, unknown> = {};
    if (body.accountType !== undefined) update.account_type = body.accountType;

    const { data, error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id)
      .select()
      .single();
    if (error) return apiError('INTERNAL_ERROR', error.message);
    return apiOk(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return apiError('VALIDATION_ERROR', '입력값을 확인해주세요', {
        fieldErrors: err.flatten().fieldErrors,
      });
    }
    return apiError('INTERNAL_ERROR', '알 수 없는 오류');
  }
}
