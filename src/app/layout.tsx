import { Toaster } from 'sonner';

import { QueryProvider } from '@/lib/query/provider';

import './globals.css';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'ClipArt Studio',
  description: '만들면 계정의 자산이 되는 AI 클립아트 서비스',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
