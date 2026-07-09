// Home — search entry + navigation. Community 자동 큐레이션은 Module 5에서 이 자리에 붙입니다.

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-16 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">
          찾고, 없으면 만들고, 만들면 계정의 자산이 됩니다
        </h1>
        <p className="text-lg text-muted-foreground">
          상단 검색창에서 이미지를 찾아보세요. 원하는 결과가 없다면 AI로 직접 만들면 됩니다.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link href="/generate" className={buttonVariants({ size: 'lg' })}>
          AI로 이미지 만들기
        </Link>
        <Link
          href="/library"
          className={buttonVariants({ variant: 'outline', size: 'lg' })}
        >
          내 라이브러리 열기
        </Link>
      </div>
    </div>
  );
}
