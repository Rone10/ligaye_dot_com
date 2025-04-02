'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Building2, 
  Users, 
  Menu, 
  X 
} from 'lucide-react'

const navItems = [
  {
    name: 'Dashboard Overview',
    href: '/employer',
    icon: LayoutDashboard
  },
  {
    name: 'Post a Job',
    href: '/employer/jobs/new',
    icon: FileText
  },
  {
    name: 'My Job Postings',
    href: '/employer/jobs',
    icon: Briefcase
  },
  {
    name: 'Company Profile',
    href: '/employer/profile',
    icon: Building2
  },
  {
    name: 'Applicants',
    href: '/employer/jobs',
    icon: Users
  }
]

export default function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30
        w-64 bg-background/80 backdrop-blur-md
        border-r border-[rgba(255,255,255,0.3)]
        shadow-[0_8px_32px_rgba(31,38,135,0.1)]
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="py-6 px-2">
            <h2 className="text-xl font-bold text-[#1a1e2d]">Employer Dashboard</h2>
          </div>
          
          <nav className="space-y-2 mt-6 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm
                    rounded-md transition-all duration-300
                    hover:bg-[#4a6cfa]/10 hover:translate-y-[-2px]
                    ${isActive 
                      ? 'bg-[#4a6cfa]/10 text-[#4a6cfa] font-semibold shadow-sm' 
                      : 'text-[#1a1e2d]'}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
} 