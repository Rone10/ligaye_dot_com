
import type { Metadata } from 'next';



const metadata: Metadata = {
    title: 'Blog Post | Ligaye.com',
    description: 'Read the latest insights and trends in the Gambian job market.',
    keywords: 'Gambia jobs, career advice, job market trends',
    authors: [{ name: 'Ligaye.com' }],
    openGraph: {
      title: 'Blog Post | Ligaye.com',
      description: 'Read the latest insights and trends in the Gambian job market.',
    },
  };

export default async function BlogDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
            {children}
    
    </>
  );
}
