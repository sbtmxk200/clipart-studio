import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { createSupabaseServerClient } from '@/services/supabase/server';

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoginForm />
    </div>
  );
}
