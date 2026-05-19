'use client';

import localFont from 'next/font/local';
import { usePathname } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Header, Navigation } from '@/components/layout';
import { ThemeProvider } from '@/components/theme-provider';

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Elasticsearch Management</title>
        <meta name="description" content="Manage your Elasticsearch cluster with ease" />
        <link rel="icon" href="/es_logo.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
