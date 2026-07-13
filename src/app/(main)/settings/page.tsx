// Settings 페이지 — 학교설정과 참조 이미지 슬롯을 함께 관리한다.

import { redirect } from 'next/navigation';

import { SchoolProfileSection } from '@/features/profile/components/SchoolProfileSection';
import { ReferenceImagesSection } from '@/features/references/components/ReferenceImagesSection';
import { createSupabaseServerClient } from '@/services/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">설정</h1>
      <SchoolProfileSection initialProfile={schoolProfile ?? null} />
      <ReferenceImagesSection />
    </div>
  );
}
