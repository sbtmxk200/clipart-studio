'use client';

// Design Ref: §5.4 Search page — URL param sync, tabs, results grid
// URL is the single source of truth: /search?q=<q>&scope=<scope>. Router state changes
// re-run the query. This keeps deep links + back button behaving intuitively.

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilterTabs } from '@/features/search/components/SearchFilterTabs';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import { useSearch } from '@/features/search/hooks/useSearch';

import type { SearchScope } from '@/features/search/hooks/useSearch';

function isScope(value: string | null): value is SearchScope {
  return value === 'all' || value === 'mine' || value === 'community';
}

export function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q')?.trim() ?? '';
  const scopeParam = params.get('scope');
  const scope: SearchScope = isScope(scopeParam) ? scopeParam : 'all';

  const { data, isLoading, isError, refetch } = useSearch(q, scope);

  function setScope(next: SearchScope) {
    const searchParams = new URLSearchParams(params.toString());
    searchParams.set('scope', next);
    router.replace(`/search?${searchParams.toString()}`);
  }

  if (!q) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
          <p>상단 검색창에서 찾고 싶은 이미지를 검색해보세요.</p>
          <Link href="/generate" className={buttonVariants({ size: 'sm' })}>
            AI로 만들어보기
          </Link>
        </CardContent>
      </Card>
    );
  }

  const images = data?.images ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchFilterTabs scope={scope} onChange={setScope} />
        {typeof data?.total === 'number' && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {data.total.toLocaleString()}개 결과
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-muted"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
            검색 중 문제가 생겼어요.
            <button
              type="button"
              onClick={() => refetch()}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              다시 시도
            </button>
          </CardContent>
        </Card>
      ) : images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
            <p>
              &quot;{q}&quot; 에 대한 결과가 없어요.
              <br />
              직접 만들어보시겠어요?
            </p>
            <Link
              href={`/generate?prompt=${encodeURIComponent(q)}`}
              className={buttonVariants({ size: 'sm' })}
            >
              &quot;{q}&quot; 로 AI 이미지 만들기
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <SearchResultCard key={image.id} image={image} />
          ))}
        </div>
      )}
    </div>
  );
}
