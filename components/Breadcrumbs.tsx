import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import StructuredData from './StructuredData';

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ligaye.com';
  
  // Generate structured data
  const schemaItems = items.map((item, index) => ({
    name: item.name,
    url: item.href ? `${baseUrl}${item.href}` : `${baseUrl}`,
  }));
  
  const breadcrumbSchema = generateBreadcrumbSchema(schemaItems);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-1 text-sm ${className}`}
      >
        <Link 
          href="/" 
          className="text-theme-gray-dark hover:text-primary-blue transition-colors"
        >
          Home
        </Link>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-theme-gray-dark" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-theme-gray-dark hover:text-primary-blue transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-theme-dark font-medium">{item.name}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
}