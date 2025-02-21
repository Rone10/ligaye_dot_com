'use client';

import { Twitter, Linkedin, Facebook } from 'lucide-react';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/jobboard' },
  { icon: Linkedin, href: 'https://linkedin.com/company/jobboard' },
  { icon: Facebook, href: 'https://facebook.com/jobboard' },
];

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <a href="/" className="text-xl font-bold text-blue-600">JobBoard</a>
            <p className="mt-2 text-gray-600">Find your dream job today</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{footerLinks.company.title}</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{footerLinks.support.title}</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Follow Us</h3>
            <div className="mt-4 flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    className="text-gray-600 hover:text-gray-900"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-gray-600">
          © 2025 JobBoard. All rights reserved.
        </div>
      </div>
    </footer>
  );
}