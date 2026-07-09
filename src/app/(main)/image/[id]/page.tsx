// Design Ref: §5.4 Image Detail Page — server auth guard, delegates to client view

import { redirect } from 'next/navigation';

import { ImageDetailView } from '@/features/library/components/ImageDetailView';
import { createSupabaseServerClient } from '@/services/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ImageDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-6xl">
      <ImageDetailView id={params.id} />
    </div>
  );
}
