import { LucideIcon } from 'lucide-react'

interface PageHeadingProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
}

export function PageHeading({
  title,
  description,
  icon: Icon,
  actions,
}: PageHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0 ml-auto">{actions}</div>}
    </div>
  )
} 