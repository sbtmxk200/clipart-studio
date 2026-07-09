'use client';

import { Home, Image as ImageIcon, School, Sparkles, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/library', label: '내 라이브러리', icon: ImageIcon },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/official', label: '공식 컬렉션', icon: Star },
  { href: '/generate', label: 'AI 생성', icon: Sparkles },
];

export function AppSidebar({ hasSchoolProfile }: { hasSchoolProfile: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/30 p-3 md:block">
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}

        <div className="border-t pt-2" />

        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/profile'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <School className="h-4 w-4" aria-hidden="true" />
          {hasSchoolProfile ? 'School Profile' : 'School Profile 추가'}
        </Link>
      </nav>
    </aside>
  );
}
