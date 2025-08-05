import { JobPosting, WithContext, Organization, WebSite, BreadcrumbList } from 'schema-dts';

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

// Helper to render structured data as a script tag
export function renderStructuredData(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}