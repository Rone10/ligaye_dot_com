'use client';

import { Avatar } from '@/components/ui/avatar';

export function UserInfo() {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" 
            alt="John Smith"
            className="object-cover"
          />
        </Avatar>
        <div>
          <div className="font-medium">John Smith</div>
          <div className="text-sm text-gray-500">john@example.com</div>
        </div>
      </div>
    </div>
  );
}