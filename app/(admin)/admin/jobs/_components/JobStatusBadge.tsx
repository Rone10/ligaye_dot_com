import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Active",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
    PENDING_PAYMENT: {
      label: "Pending Payment",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    },
    DRAFT: {
      label: "Draft",
      variant: "secondary" as const,
      className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    },
    EXPIRED: {
      label: "Expired",
      variant: "secondary" as const,
      className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    },
    FILLED: {
      label: "Filled",
      variant: "secondary" as const,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    DELETED: {
      label: "Deleted",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 hover:bg-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "outline" as const,
    className: "",
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}