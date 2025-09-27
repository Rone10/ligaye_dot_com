import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo/metadata';
import ContactForm from './_components/ContactForm';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: 'Contact Us - Ligaye.com',
    description: 'Get in touch with Ligaye.com. Have questions about job postings, applications, or our services? We\'re here to help you navigate Gambia\'s job market.',
    path: '/contact-us',
    keywords: [
      'contact Ligaye',
      'Ligaye support',
      'job board help Gambia',
      'employment support Gambia',
      'job posting help',
      'career assistance Gambia',
      'Ligaye customer service',
      'contact job board Gambia'
    ],
  });
}

export default function ContactUsPage() {
  return <ContactForm />;
}