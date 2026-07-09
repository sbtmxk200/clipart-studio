// Design Ref: §5.4 Generation Page composition — server fetches School Profile + credits, delegates UI to client
// Plan SC: FR-05 batch request UI, FR-17 conditional school toggle

import { redirect } from 'next/navigation';

import { GenerationForm } from '@/features/generation/components/GenerationForm';
import { BatchProgressPanel } from '@/features/generation/components/BatchProgressPanel';
import { createSupabaseServerClient } from '@/services/supabase/server';

export const dynamic = 'force-dynamic';

export default async function GeneratePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: schoolProfile }] = await Promise.all([
    supabase.from('profiles').select('credits').eq('id', user.id).single(),
    supabase.from('school_profiles').select('school_name').eq('user_id', user.id).maybeSingle(),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="min-w-0">
        <GenerationForm
          hasSchoolProfile={!!schoolProfile}
          schoolName={(schoolProfile?.school_name as string) ?? null}
          initialCredits={profile?.credits ?? 0}
        />
      </div>
      <div className="min-w-0">
        <BatchProgressPanel />
      </div>
    </div>
  );
}
