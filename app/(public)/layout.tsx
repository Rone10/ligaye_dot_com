import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import { getUser } from '@/lib/supabase/server';
import Footer from '@/components/Footer';
import EmployerSidebar from '../(dashboard)/employer/_components/EmployerSidebar';
import CandidateSidebar from '../(dashboard)/candidate/_components/CandidateSidebar';


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
  const isEmployer = user?.user_metadata.role === 'employer';
  const isCandidate = user?.user_metadata.role === 'candidate';

  return (
    <div className="bg-gradient-to-br from-[#e9efff] to-[#f4f7ff] min-h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex flex-1 overflow-hidden">
        {/* {(isEmployer || isCandidate) && (
          <aside className="hidden md:flex flex-shrink-0 flex-col bg-white/70 backdrop-blur-md border-r border-white/30 shadow-md h-full overflow-y-auto">
            {isEmployer && <EmployerSidebar />}
            {isCandidate && <CandidateSidebar />}
          </aside>
        )} */}

        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
