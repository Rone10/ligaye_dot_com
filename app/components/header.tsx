'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Companies', href: '/companies' },
  { label: 'Career Advice', href: '/career-advice' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center">
        <a href="/" className="text-xl font-bold text-blue-600">JobBoard</a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6 flex-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-blue-600">Sign In</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Post a Job</Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex flex-1 justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-4 pt-4 border-t">
                  <Button variant="outline">Sign In</Button>
                  <Button>Post a Job</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}