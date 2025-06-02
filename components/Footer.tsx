import Link from 'next/link';

export default function Footer() {
  return (
    <footer className=" bg-gradient-from-theme-dark to-theme-gray py-10 px-4 md:px-8 border-t border-theme-gray dark:border-theme-gray">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl  font-semibold mb-4">Ligaye.com</h3>
            <p className="text-theme-gray-dark">Connecting talent with </p>
            <p className="text-theme-gray-dark">opportunity across The Gambia.</p>
          </div>
          
          <div>
            <h4 className="text-lg  font-medium mb-3">For Job Seekers</h4>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-theme-gray-dark hover:text-theme-dark">Find Jobs</Link></li>
              <li><Link href="/sign-up" className="text-theme-gray-dark hover:text-theme-dark">Create Profile</Link></li>
              {/* <li><Link href="/job-alerts" className="text-theme-gray-dark hover:text-theme-light">Job Alerts</Link></li> */}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg  font-medium mb-3 ">For Employers</h4>
            <ul className="space-y-2">
              <li><Link href="/employer/jobs/new" className="text-theme-gray-dark hover:text-theme-dark">Post a Job</Link></li>
              <li><Link href="/pricing" className="text-theme-gray-dark hover:text-theme-dark">Pricing</Link></li>
              {/* <li><Link href="/resources" className="text-theme-gray-dark hover:text-theme-light">Resources</Link></li> */}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg  font-medium mb-3">Contact</h4>
            <ul className="space-y-2">
              {/* <li><Link href="/about" className="text-theme-gray-dark hover:text-theme-light">About Us</Link></li> */}
              <li><Link href="/contact-us" className="text-theme-gray-dark hover:text-theme-dark">Support</Link></li>
              <li><Link href="/privacy" className="text-theme-gray-dark hover:text-theme-dark">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ligaye.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}