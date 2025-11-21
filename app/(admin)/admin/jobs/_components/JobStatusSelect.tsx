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
import { Loader2 } from "lucide-react";

interface JobStatusSelectProps {
  jobId: string;
  currentStatus: string;
  onStatusChange: (jobId: string, newStatus: string) => Promise<void>;
  disabled?: boolean;
}

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

export function JobStatusSelect({
  jobId,
  currentStatus,
  onStatusChange,
  disabled = false
}: JobStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[currentStatus as keyof typeof statusConfig] || {
    label: currentStatus,
    dotColor: "bg-gray-400",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

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
      <Badge variant="outline" className={`${config.className} rounded-full pl-2 pr-3 py-1 font-medium text-xs border`}>
        {isUpdating ? (
          <>
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor} mr-2`} />
            {config.label}
          </>
        )}
      </Badge>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={`${config.className} border rounded-full h-auto pl-2 pr-3 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}>
        <div className="flex items-center gap-0">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor} mr-2`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">
          <div className="flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
            Active
          </div>
        </SelectItem>
        <SelectItem value="EXPIRED">
          <div className="flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mr-2" />
            Expired
          </div>
        </SelectItem>
        <SelectItem value="FILLED">
          <div className="flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
            Filled
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}