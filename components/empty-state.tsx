import { AlertCircle, FileQuestion, Bookmark, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: 'FileQuestion' | 'AlertCircle' | 'Bookmark'
  iconClassName?: string
  children?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon = 'FileQuestion',
  iconClassName,
  children,
}: EmptyStateProps) {
  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'AlertCircle':
        return <AlertCircle className="h-6 w-6 text-foreground/70" />
      case 'Bookmark':
        return <Bookmark className="h-6 w-6 text-foreground/70" />
      case 'FileQuestion':
      default:
        return <FileQuestion className="h-6 w-6 text-foreground/70" />
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border bg-background">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4", iconClassName)}>
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
} 