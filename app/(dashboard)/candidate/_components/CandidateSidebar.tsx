'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User2, 
  BookmarkIcon, 
  Menu, 
  X,
  LogOut,
  Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

const navItems = [
  {
    name: 'Dashboard Overview',
    href: '/candidate',
    icon: LayoutDashboard
  },
  {
    name: 'Browse Jobs',
    href: '/jobs',
    icon: Search
  },
  {
    name: 'My Applications',
    href: '/candidate/applications',
    icon: Briefcase
  },
  {
    name: 'Saved Jobs',
    href: '/candidate/saved-jobs',
    icon: BookmarkIcon
  },
  {
    name: 'My Resume',
    href: '/candidate/profile?tab=resume',
    icon: FileText
  },
  {
    name: 'Profile',
    href: '/candidate/profile',
    icon: User2
  }
]

export default function CandidateSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUserData(user)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  // Get user name and initials for avatar
  const userName = userData?.user_metadata?.first_name || 
                   userData?.user_metadata?.name || 
                   userData?.email?.split('@')[0] || 
                   'Candidate'
  
  const userEmail = userData?.email || ''
  
  const getInitials = () => {
    if (!userName) return 'CN'
    
    const initials = userData?.user_metadata?.first_name?.charAt(0) + userData?.user_metadata?.last_name?.charAt(0)
    return initials || userName.substring(0, 2).toUpperCase()
  }
  
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
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }
  
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
          {/* Title & mobile close button */}
          <div className="flex items-center justify-between py-2 px-2">
            <h2 className="text-xl font-bold text-[#1a1e2d]">Candidate Portal</h2>
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
          
          {/* User profile section */}
          <div className="mt-4 mb-6 p-4 rounded-lg bg-[#4a6cfa]/5 border border-[#4a6cfa]/10">
            {loading ? (
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border-2 border-[#4a6cfa]/20">
                  <AvatarImage src={userData?.user_metadata?.avatar_url || ''} />
                  <AvatarFallback className="bg-[#4a6cfa]/10 text-[#4a6cfa]">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#1a1e2d] line-clamp-1">{userName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{userEmail}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2 flex-1">
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
          
          {/* Logout button */}
          <div className="mt-auto pt-4 border-t border-[rgba(0,0,0,0.1)]">
            <Button
              variant="outline"
              className="w-full justify-start text-[#1a1e2d] hover:bg-[#4a6cfa]/10 hover:text-[#4a6cfa]"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
} 