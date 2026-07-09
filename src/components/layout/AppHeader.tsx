'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CreditBadge } from '@/features/auth/components/CreditBadge';
import { createSupabaseBrowserClient } from '@/services/supabase/client';

export function AppHeader({
  credits,
  creditsResetAt,
}: {
  credits: number;
  creditsResetAt: string | null;
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('로그아웃 실패');
      return;
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <Link href="/" className="font-semibold">
          ClipArt Studio
        </Link>
        <div className="flex items-center gap-3">
          <CreditBadge credits={credits} creditsResetAt={creditsResetAt} />
          <Link
            href="/profile"
            className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            프로필
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
