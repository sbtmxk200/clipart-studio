import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolProfileSection } from '@/features/profile/components/SchoolProfileSection';
import { createSupabaseServerClient } from '@/services/supabase/server';
import { ACCOUNT_TYPE_LABELS } from '@/types/domain';

import type { AccountType } from '@/types/domain';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">프로필</h1>

      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
          <CardDescription>기본 정보 및 크레딧 현황</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="이메일" value={profile?.email ?? '—'} />
          <Row
            label="계정 유형"
            value={profile ? ACCOUNT_TYPE_LABELS[profile.account_type as AccountType] : '—'}
          />
          <Row label="크레딧" value={`🪙 ${profile?.credits ?? 0}`} />
          <Row label="다음 리셋" value={formatDate(profile?.credits_reset_at ?? null)} />
        </CardContent>
      </Card>

      <SchoolProfileSection initialProfile={schoolProfile ?? null} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
