import '../globals.css';
import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import { getUser } from '@/lib/supabase/server';
import Footer from '@/components/Footer';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ligaye.com - Gambia\'s Premier Job Board',
  description: 'Find your dream job or hire the perfect candidate in The Gambia',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar user={user} />
        {children}
        {/* <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster  position="top-right" richColors /> */}
        <Footer />
      </body>
    </html>
  );
}
