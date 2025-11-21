import { Badge } from "@/components/ui/badge";

interface JobStatusBadgeProps {
  status: string;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const statusConfig = {
    ACTIVE: {
      label: "Active",
      dotColor: "bg-emerald-500",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    PENDING_PAYMENT: {
      label: "Pending Payment",
      dotColor: "bg-amber-500",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    DRAFT: {
      label: "Draft",
      dotColor: "bg-gray-400",
      className: "bg-gray-50 text-gray-600 border-gray-200",
    },
    EXPIRED: {
      label: "Expired",
      dotColor: "bg-orange-500",
      className: "bg-orange-50 text-orange-700 border-orange-200",
    },
    FILLED: {
      label: "Filled",
      dotColor: "bg-blue-500",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    DELETED: {
      label: "Deleted",
      dotColor: "bg-red-500",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    dotColor: "bg-gray-400",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <Badge variant="outline" className={`${config.className} rounded-full pl-2 pr-3 py-1 font-medium text-xs border`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor} mr-2`} />
      {config.label}
    </Badge>
  );
}