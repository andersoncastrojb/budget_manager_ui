import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppQueryClientProvider } from '@/application/context/QueryClientProvider';
import { ErrorBoundary } from '@/presentation/components/common/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Budget Manager | Control Your Finances',
  description:
    'Professional budget management application to track income, expenses, accounts, and loans with secure authentication.',
  keywords: ['budget', 'finance', 'expense tracking', 'money management'],
  robots: 'noindex, nofollow', // Budget management is personal, restrict indexing
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Security headers as meta tags (some are better set via headers.js) */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; connect-src 'self' http://localhost:8080; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <ErrorBoundary>
          <AppQueryClientProvider>
            {children}
          </AppQueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
