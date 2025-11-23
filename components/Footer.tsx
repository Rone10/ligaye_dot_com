import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border py-8 px-4 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/jobs" className="hover:underline">Find Jobs</Link>
          <Link href="/sign-up" className="hover:underline">Create Profile</Link>
          <Link href="/employer/jobs/new" className="hover:underline">Post a Job</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/contact-us" className="hover:underline">Support</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
          <p>&copy; {currentYear} Ligaye. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}