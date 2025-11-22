'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IndeedSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center transition-colors duration-300">
                {/* Input for 'What' */}
                <div className="flex-1 w-full relative">
                    <span className="font-bold text-sm text-black dark:text-gray-300 absolute left-3 top-1/2 -translate-y-1/2">What</span>
                    <input
                        type="text"
                        placeholder="Job title, keywords, or company"
                        className="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-black dark:text-white bg-transparent placeholder-gray-400"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <Button type="submit" className="w-full md:w-auto bg-[#2557a7] hover:bg-[#2557a7]/90 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md">
                    Find jobs
                </Button>
            </form>
        </div>
    );
}
