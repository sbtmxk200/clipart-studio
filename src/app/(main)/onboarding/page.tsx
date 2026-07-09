import { redirect } from 'next/navigation';

import { OnboardingWizard } from '@/features/auth/components/OnboardingWizard';
import { createSupabaseServerClient } from '@/services/supabase/server';

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: schoolProfile } = await supabase
    .from('school_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_type')
    .eq('id', user.id)
    .single();

  // Already completed onboarding — go home
  if (schoolProfile || profile?.account_type !== 'general') {
    redirect('/');
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <OnboardingWizard />
    </div>
  );
}
