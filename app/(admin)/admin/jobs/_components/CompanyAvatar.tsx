"use client";

import { Building2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CompanyAvatarProps {
  companyName: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export function CompanyAvatar({ companyName, logoUrl, size = "md" }: CompanyAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  // Get initials from company name (first 2 letters)
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color based on company name
  const getColorClass = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-cyan-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getInitials(companyName);
  const colorClass = getColorClass(companyName);

  // Show logo if available and no error
  if (logoUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0`}>
        <Image
          src={logoUrl}
          alt={`${companyName} logo`}
          width={size === "sm" ? 32 : size === "md" ? 40 : 48}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback to initials or icon
  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-md flex items-center justify-center flex-shrink-0`}>
      {initials ? (
        <span className="font-semibold text-white">{initials}</span>
      ) : (
        <Building2 className="text-white" size={iconSizes[size]} />
      )}
    </div>
  );
}
