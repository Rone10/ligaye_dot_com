import { JobPosting, WithContext, Organization, WebSite, BreadcrumbList, Article, Person } from 'schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ligaye.com';

interface JobPostingData {
  title: string;
  description: string;
  company: {
    name: string;
    website?: string;
    description?: string;
  };
  location?: {
    name: string;
    country?: string;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    frequency?: string;
  };
  jobType?: string;
  experienceLevel?: string;
  datePosted: Date;
  validThrough?: Date;
  applicationMethod?: string;
  employmentType?: string[];
  workLocation?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
}

export function generateJobPostingSchema(data: JobPostingData): WithContext<JobPosting> {
  const {
    title,
    description,
    company,
    location,
    salary,
    jobType,
    experienceLevel,
    datePosted,
    validThrough,
    applicationMethod,
    employmentType = [],
    workLocation,
  } = data;

  const hiringOrganization: Organization = {
    '@type': 'Organization',
    name: company.name,
    ...(company.website && { sameAs: company.website }),
    ...(company.description && { description: company.description }),
  };

  const schema: WithContext<JobPosting> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted: datePosted.toISOString(),
    hiringOrganization,
    ...(validThrough && { validThrough: validThrough.toISOString() }),
    ...(experienceLevel && { experienceRequirements: experienceLevel }),
  };

  // Add location
  if (location) {
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location.name,
        addressCountry: location.country || 'GM', // Gambia country code
      },
    };
  }

  // Add salary information
  if (salary && (salary.min || salary.max)) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: salary.currency || 'GMD',
      value: {
        '@type': 'QuantitativeValue',
        ...(salary.min && { minValue: salary.min }),
        ...(salary.max && { maxValue: salary.max }),
        ...(salary.frequency && { unitText: salary.frequency }),
      },
    };
  }

  // Add employment type
  if (employmentType.length > 0) {
    schema.employmentType = employmentType as any;
  }

  // Add work location type
  if (workLocation) {
    if (workLocation === 'REMOTE') {
      schema.jobLocationType = 'TELECOMMUTE';
    }
  }

  // Add application instructions
  if (applicationMethod === 'PLATFORM') {
    schema.applicationContact = {
      '@type': 'ContactPoint',
      contactType: 'HR',
      url: `${BASE_URL}/jobs/${title.toLowerCase().replace(/\s+/g, '-')}`,
    };
  }

  return schema;
}

export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ligaye.com',
    url: BASE_URL,
    logo: `${BASE_URL}/branding/full_logo.png`,
    description: "Gambia's premier job board connecting job seekers with employers",
    sameAs: [
      'https://twitter.com/ligaye_com',
      'https://facebook.com/ligaye',
      'https://linkedin.com/company/ligaye',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@ligaye.com',
      url: `${BASE_URL}/contact-us`,
    },
  };
}

export function generateWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Ligaye.com',
    description: "Find jobs in Gambia - Gambia's premier job board",
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/jobs?search={search_term_string}`,
      },
    } as any,
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Article schema for blog posts
interface ArticleData {
  title: string;
  description: string;
  author: {
    name: string;
    email?: string;
  };
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  keywords?: string[];
  wordCount?: number;
  slug: string;
}

export function generateArticleSchema(data: ArticleData): WithContext<Article> {
  const {
    title,
    description,
    author,
    datePublished,
    dateModified,
    image,
    keywords,
    wordCount,
    slug,
  } = data;

  const articleAuthor: Person = {
    '@type': 'Person',
    name: author.name,
    ...(author.email && { email: author.email }),
  };

  const schema: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: articleAuthor,
    datePublished: datePublished.toISOString(),
    ...(dateModified && { dateModified: dateModified.toISOString() }),
    publisher: {
      '@type': 'Organization',
      name: 'Ligaye.com',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/branding/full_logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
      },
    }),
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(wordCount && { wordCount }),
  };

  return schema;
}

// LocalBusiness schema for Ligaye as a Gambian business
export function generateLocalBusinessSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#business`,
    name: 'Ligaye.com',
    description: "Gambia's premier job board connecting job seekers with employers",
    url: BASE_URL,
    logo: `${BASE_URL}/branding/full_logo.png`,
    image: `${BASE_URL}/branding/full_logo.png`,
    telephone: '+220 123 4567',
    email: 'support@ligaye.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Banjul',
      addressCountry: 'GM',
      postalCode: '00220',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 13.4549,
      longitude: -16.5790,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    sameAs: [
      'https://twitter.com/ligaye_com',
      'https://facebook.com/ligaye',
      'https://linkedin.com/company/ligaye',
    ],
    priceRange: '$$',
  };
}

// Helper to render structured data as a script tag
export function renderStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}