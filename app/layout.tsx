// app/layout.tsx
'use client'; // This file now needs to be a client component to use providers

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

// Note: We can't export Metadata from a client component.
// We would move it to page.tsx or a server component layout if needed.
// export const metadata: Metadata = {
//   title: 'Sentinel Dashboard',
//   description: 'AI Compliance Dashboard',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}