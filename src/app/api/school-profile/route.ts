// Design Ref: §4.1 GET/POST/PUT/DELETE /api/school-profile
// Plan SC: FR-03 School Profile Optional CRUD

import { ZodError } from 'zod';

import { apiError, apiOk } from '@/lib/api-error';
import { createSupabaseServerClient } from '@/services/supabase/server';
import { schoolProfileSchema } from '@/types/schemas';

function toDbFields(input: ReturnType<typeof schoolProfileSchema.parse>) {
  return {
    school_name: input.schoolName,
    homepage_url: input.homepageUrl || null,
    logo_url: input.logoUrl ?? null,
    primary_color: input.primaryColor ?? null,
    mascot_desc: input.mascotDesc ?? null,
    mascot_ref_url: input.mascotRefUrl ?? null,
    building_ref_url: input.buildingRefUrl ?? null,
    style_desc: input.styleDesc ?? null,
    base_prompt: input.basePrompt ?? null,
    school_level: input.schoolLevel ?? null,
  };
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  const { data, error } = await supabase
    .from('school_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return apiError('INTERNAL_ERROR', error.message);
  return apiOk(data);
}

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  try {
    const parsed = schoolProfileSchema.parse(await request.json());
    const { data, error } = await supabase
      .from('school_profiles')
      .insert({ user_id: user.id, ...toDbFields(parsed) })
      .select()
      .single();
    if (error) return apiError('INTERNAL_ERROR', error.message);
    return apiOk(data, 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return apiError('VALIDATION_ERROR', '입력값을 확인해주세요', {
        fieldErrors: err.flatten().fieldErrors,
      });
    }
    return apiError('INTERNAL_ERROR', '알 수 없는 오류');
  }
}

export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  try {
    const parsed = schoolProfileSchema.parse(await request.json());
    const { data, error } = await supabase
      .from('school_profiles')
      .update(toDbFields(parsed))
      .eq('user_id', user.id)
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

export async function DELETE() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', '로그인이 필요합니다');

  const { error } = await supabase.from('school_profiles').delete().eq('user_id', user.id);
  if (error) return apiError('INTERNAL_ERROR', error.message);
  return apiOk({ deleted: true });
}
