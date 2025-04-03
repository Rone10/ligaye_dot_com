import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {children}
    </div>
  )
} 