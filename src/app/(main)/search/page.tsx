// Design Ref: §5.4 Search Result Page — server auth guard, delegates results to client
// URL is source of truth: /search?q=<query>&scope=<all|mine|community>

import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SearchResults } from '@/features/search/components/SearchResults';
import { createSupabaseServerClient } from '@/services/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">검색</h1>
        <p className="text-sm text-muted-foreground">
          내 라이브러리, Community 공개 이미지에서 프롬프트/태그/카테고리로 검색합니다.
        </p>
      </div>
      <Suspense fallback={null}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
