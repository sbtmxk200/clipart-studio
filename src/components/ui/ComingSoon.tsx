import { Construction } from 'lucide-react';

export function ComingSoon({ title, module }: { title: string; module: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 pt-24 text-center">
      <Construction className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        이 페이지는 <span className="font-medium">{module}</span> 에서 구현됩니다.
      </p>
    </div>
  );
}
