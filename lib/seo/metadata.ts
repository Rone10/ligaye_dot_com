import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ligaye.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/branding/full_logo.png`;

interface BaseMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  noIndex?: boolean;
}

export function generateSEOMetadata(options: BaseMetadataOptions): Metadata {
  const {
    title,
    description,
    path = '',
    image = DEFAULT_OG_IMAGE,
    keywords = [],
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noIndex = false,
  } = options;

  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Ligaye.com - Jobs in Gambia`;
  
  // Base keywords for all pages
  const baseKeywords = ['jobs in Gambia', 'Gambian jobs', 'employment Gambia', 'careers Gambia'];
  const allKeywords = [...new Set([...keywords, ...baseKeywords])];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    authors: author ? [{ name: author }] : [{ name: 'Ligaye.com' }],
    creator: 'Ligaye.com',
    publisher: 'Ligaye.com',
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Ligaye.com',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type as any,
      ...(publishedTime && { publishedTime: publishedTime.toISOString() }),
      ...(modifiedTime && { modifiedTime: modifiedTime.toISOString() }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ligaye_com',
      site: '@ligaye_com',
    },
    alternates: {
      canonical: url,
    },
    metadataBase: new URL(BASE_URL),
  };

  return metadata;
}

// Helper function for job-specific metadata
export function generateJobMetadata({
  jobTitle,
  companyName,
  location,
  salary,
  jobType,
  experienceLevel,
  description,
  jobId,
  publishedDate,
  updatedDate,
}: {
  jobTitle: string;
  companyName: string;
  location?: string;
  salary?: { min?: number; max?: number; currency?: string };
  jobType?: string;
  experienceLevel?: string;
  description: string;
  jobId: string;
  publishedDate?: Date;
  updatedDate?: Date;
}): Metadata {
  const locationText = location || 'Gambia';
  const salaryText = salary?.min && salary?.max 
    ? `${salary.currency || 'GMD'} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
    : salary?.min 
    ? `Starting from ${salary.currency || 'GMD'} ${salary.min.toLocaleString()}`
    : '';
  
  const title = `${jobTitle} at ${companyName} - ${locationText}`;
  const metaDescription = `${jobTitle} position at ${companyName} in ${locationText}. ${salaryText ? `Salary: ${salaryText}. ` : ''}${jobType ? `${jobType}. ` : ''}${description.slice(0, 150)}...`;
  
  const keywords = [
    jobTitle,
    companyName,
    locationText,
    `${jobTitle} jobs ${locationText}`,
    `${companyName} careers`,
    jobType,
    experienceLevel,
  ].filter(Boolean) as string[];

  return generateSEOMetadata({
    title,
    description: metaDescription,
    path: `/jobs/${jobId}`,
    keywords,
    type: 'article',
    publishedTime: publishedDate,
    modifiedTime: updatedDate,
  });
}

// Helper function for location-based job listing pages
export function generateLocationJobsMetadata({
  location,
  jobCount,
}: {
  location: string;
  jobCount: number;
}): Metadata {
  const title = `Jobs in ${location}`;
  const description = `Find ${jobCount} job opportunities in ${location}, Gambia. Browse the latest openings from top employers and apply today on Ligaye.com.`;
  
  return generateSEOMetadata({
    title,
    description,
    path: `/jobs?location=${encodeURIComponent(location)}`,
    keywords: [
      `jobs in ${location}`,
      `${location} employment`,
      `careers in ${location}`,
      `${location} job vacancies`,
      `work in ${location}`,
    ],
  });
}

// Helper function for industry-based job listing pages
export function generateIndustryJobsMetadata({
  industry,
  jobCount,
}: {
  industry: string;
  jobCount: number;
}): Metadata {
  const title = `${industry} Jobs in Gambia`;
  const description = `Explore ${jobCount} ${industry} job opportunities in Gambia. Find your next career move in the ${industry} sector on Ligaye.com.`;
  
  return generateSEOMetadata({
    title,
    description,
    path: `/jobs?industry=${encodeURIComponent(industry)}`,
    keywords: [
      `${industry} jobs Gambia`,
      `${industry} careers`,
      `${industry} employment Gambia`,
      `${industry} vacancies`,
      `${industry} positions Gambia`,
    ],
  });
}