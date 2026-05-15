'use client';

import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Header, Navigation } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <title>Elasticsearch Management</title>
        <meta name="description" content="Manage your Elasticsearch cluster with ease" />
        <link rel="icon" href="/es_logo.png" />
      </head>
      <body className={inter.className}>
        {!isLoginPage && (
          <>
            <Header />
            <Navigation />
          </>
        )}
        <div className={isLoginPage ? '' : 'pt-[133px]'}>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
