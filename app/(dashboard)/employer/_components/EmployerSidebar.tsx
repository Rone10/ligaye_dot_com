'use client'

import { useState, useEffect, useRef } from 'react'
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
    href: '/employer/jobs/applicants',
    icon: Users
  }
]

export default function EmployerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])
  
  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 left-4 z-50 md:hidden ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 bg-background/95 backdrop-blur-md
          border-r border-[rgba(255,255,255,0.3)]
          shadow-[0_8px_32px_rgba(31,38,135,0.1)]
          transition-all duration-300 ease-in-out
          md:translate-x-0 md:static md:h-full md:min-h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between py-6 px-2">
            <h2 className="text-xl font-bold text-[#1a1e2d]">Employer Dashboard</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-[#4a6cfa]/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-[#1a1e2d]" />
            </Button>
          </div>
          
          <nav className="space-y-2 mt-6 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
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