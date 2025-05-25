import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl text-white font-semibold mb-4">Ligaye.com</h3>
              <p className="text-zinc-400">Gambia&apos;s Premier Job Board</p>
            </div>
            
            <div>
              <h4 className="text-lg text-white font-medium mb-3">For Job Seekers</h4>
              <ul className="space-y-2">
                <li><Link href="/jobs" className="text-zinc-400 hover:text-white">Find Jobs</Link></li>
                <li><Link href="/create-profile" className="text-zinc-400 hover:text-white">Create Profile</Link></li>
                {/* <li><Link href="/job-alerts" className="text-zinc-400 hover:text-white">Job Alerts</Link></li> */}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-white font-medium mb-3 ">For Employers</h4>
              <ul className="space-y-2">
                <li><Link href="/employer/jobs/new" className="text-zinc-400 hover:text-white">Post a Job</Link></li>
                <li><Link href="/pricing" className="text-zinc-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/resources" className="text-zinc-400 hover:text-white">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg text-white font-medium mb-3">Contact</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-zinc-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-zinc-400 hover:text-white">Support</Link></li>
                <li><Link href="/privacy" className="text-zinc-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} Ligaye.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
}