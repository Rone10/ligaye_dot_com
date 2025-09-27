"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

interface JobStatusSelectProps {
  jobId: string;
  currentStatus: string;
  onStatusChange: (jobId: string, newStatus: string) => Promise<void>;
  disabled?: boolean;
}

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
    icon: CheckCircle,
  },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    icon: Clock,
  },
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    icon: Clock,
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
    icon: Clock,
  },
  FILLED: {
    label: "Filled",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    icon: CheckCircle,
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
    icon: Clock,
  },
};

export function JobStatusSelect({
  jobId,
  currentStatus,
  onStatusChange,
  disabled = false
}: JobStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[currentStatus as keyof typeof statusConfig] || {
    label: currentStatus,
    className: "bg-gray-100 text-gray-800",
    icon: Clock,
  };

  const Icon = config.icon;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await onStatusChange(jobId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  if (disabled || isUpdating) {
    return (
      <Badge className={config.className}>
        {isUpdating ? (
          <>
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
          </>
        )}
      </Badge>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={`${config.className} border-none h-auto p-1 px-2 text-xs font-medium rounded-md cursor-pointer hover:opacity-80 transition-opacity`}>
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Active
          </div>
        </SelectItem>
        <SelectItem value="EXPIRED">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-orange-600" />
            Expired
          </div>
        </SelectItem>
        <SelectItem value="FILLED">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
            Filled
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}