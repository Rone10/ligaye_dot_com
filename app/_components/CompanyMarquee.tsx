'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Company {
    name: string;
    logoUrl: string | null;
}

interface CompanyMarqueeProps {
    companies: Company[];
}

export default function CompanyMarquee({ companies }: CompanyMarqueeProps) {
    // Duplicate the list to create a seamless loop
    const [displayCompanies, setDisplayCompanies] = useState<Company[]>([]);

    useEffect(() => {
        // Ensure we have enough items to scroll smoothly
        // If we have very few items, we might need to duplicate multiple times
        let items = [...companies];
        if (items.length > 0) {
            while (items.length < 10) {
                items = [...items, ...companies];
            }
            // Add one more full set for the loop
            setDisplayCompanies([...items, ...items]);
        }
    }, [companies]);

    if (!companies || companies.length === 0) {
        return null;
    }

    return (
        <div className="w-full overflow-hidden bg-white dark:bg-background py-8">
            <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trusted by top companies hiring now
                </p>
            </div>

            <div className="relative w-full flex overflow-hidden group">
                <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
                    {displayCompanies.map((company, index) => (
                        <div
                            key={`${company.name}-${index}`}
                            className="mx-8 flex items-center justify-center min-w-[120px] h-16 transition-all duration-300"
                        >
                            {company.logoUrl ? (
                                <div className="relative w-32 h-12">
                                    <Image
                                        src={company.logoUrl}
                                        alt={`${company.name} logo`}
                                        fill
                                        className="object-contain"
                                        sizes="128px"
                                    />
                                </div>
                            ) : (
                                <span className="text-lg font-bold text-gray-400 dark:text-gray-500">{company.name}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Gradient masks for smooth fade edges */}
                <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white dark:from-background to-transparent z-10"></div>
                <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white dark:from-background to-transparent z-10"></div>
            </div>
        </div>
    );
}
