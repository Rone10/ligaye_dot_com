export default async function CandidateDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#1a1e2d]">Candidate Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] p-6 rounded-lg shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
          <h2 className="text-xl font-semibold mb-3 text-[#1a1e2d]">Applications</h2>
          <p className="text-[#9aa3bc]">Track your job applications and see their statuses.</p>
          <div className="mt-4">
            <a href="/candidate/applications" className="text-[#4a6cfa] font-medium hover:underline">View Applications →</a>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] p-6 rounded-lg shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
          <h2 className="text-xl font-semibold mb-3 text-[#1a1e2d]">Saved Jobs</h2>
          <p className="text-[#9aa3bc]">Access your bookmarked job postings for later application.</p>
          <div className="mt-4">
            <a href="/candidate/saved-jobs" className="text-[#4a6cfa] font-medium hover:underline">View Saved Jobs →</a>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] p-6 rounded-lg shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
          <h2 className="text-xl font-semibold mb-3 text-[#1a1e2d]">Complete Your Profile</h2>
          <p className="text-[#9aa3bc]">Update your resume and profile information to improve your chances.</p>
          <div className="mt-4">
            <a href="/candidate/profile" className="text-[#4a6cfa] font-medium hover:underline">Edit Profile →</a>
          </div>
        </div>
      </div>
      
      <div className="bg-white/70 backdrop-blur-md border border-[rgba(255,255,255,0.3)] p-6 rounded-lg shadow-[0_8px_32px_rgba(31,38,135,0.1)]">
        <h2 className="text-xl font-semibold mb-4 text-[#1a1e2d]">Recent Jobs</h2>
        <p className="text-[#9aa3bc] mb-4">Browse the latest job postings that match your skills.</p>
        <div className="mt-4">
          <a href="/jobs" className="text-[#4a6cfa] font-medium hover:underline">Browse All Jobs →</a>
        </div>
      </div>
    </div>
  )
} 