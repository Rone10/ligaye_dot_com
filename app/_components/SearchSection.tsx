'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/jobs');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeywordClick = (keyword: string) => {
    handleSearch(keyword);
  };

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-theme-dark text-center mb-8">
            Start Your Job Search
          </h2>
          
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-gray-dark h-5 w-5" />
            <input
              type="text"
              placeholder="Search for jobs, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-theme-gray focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 text-lg bg-background"
            />
          </form>
          
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Software Developer', 'Marketing Manager', 'Teacher', 'Accountant', 'Sales Representative'].map((term) => (
              <button
                key={term}
                onClick={() => handleKeywordClick(term)}
                className="rounded-full bg-background/90 hover:bg-background py-2 px-5 transition-all duration-300 hover:border-primary-blue hover:text-primary-blue hover:shadow-level-1 text-theme-gray-dark/90"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}