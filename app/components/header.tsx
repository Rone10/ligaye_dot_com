'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {  Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
const navItems = [
  { label: 'Find Jobs', href: '/jobs' },
  { label: 'Tenders', href: '/tenders' },
  { label: 'Blog', href: '/blogs' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b container mx-auto bg-white">
      <div className=" w-full mx-auto flex h-16 items-center justify-between">
     
        <Link href="/" className="text-xl font-bold text-blue-600">Ligaye.com</Link>
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-blue-600">Sign In</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">Post a Job</Button>
        </div>
  

        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
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