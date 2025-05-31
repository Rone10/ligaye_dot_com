'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  FileText, 
  Building2,
  LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/',
    icon: LayoutDashboard
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: CreditCard
  },
  {
    name: 'Jobs',
    href: '/admin/jobs',
    icon: FileText
  },
  {
    name: 'Employers',
    href: '/admin/employers',
    icon: Building2
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: FileText
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Close sidebar when route changes on mobile
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
          <div className="flex items-center justify-between py-6 px-2">
            <h2 className="text-xl font-bold text-primary">Admin Dashboard</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-primary/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="space-y-2 mt-6 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm
                    rounded-md transition-all duration-300
                    hover:bg-primary/10 hover:translate-y-[-2px]
                    ${isActive 
                      ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                      : 'text-foreground'}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full justify-start text-foreground hover:bg-primary/10 hover:text-primary"
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