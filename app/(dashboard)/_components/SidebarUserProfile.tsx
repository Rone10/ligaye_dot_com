import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  // Consider adding a specific icon for the user profile button when collapsed
  // UserCircle2 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { type User } from '@supabase/supabase-js'; // Uncomment if you pass the user object

interface SidebarUserProfileProps {
  // user: User | null;
  isSidebarExpanded?: boolean;
}

export function SidebarUserProfile({ isSidebarExpanded }: SidebarUserProfileProps) {
  // Placeholder data - replace with actual user data when available
  // const isLoggedIn = !!user;
  // const userName = user?.user_metadata?.full_name || user?.email || "Guest User";
  // const userEmail = user?.email;
  // const userInitials = (
  //   user?.user_metadata?.full_name?.charAt(0) || 
  //   user?.email?.charAt(0) || 
  //   'G'
  // ).toUpperCase();
  // const userImageUrl = user?.user_metadata?.avatar_url;

  // Hardcoded placeholders based on the design image:
  const isLoggedIn = true; // Assume logged in for design
  const userName = "Asal Design";
  const userEmail = "asal@design.com";
  const userInitials = "AD";
  // Using a generic placeholder image URL that often works, or you can host one in /public
  const userImageUrl = "https://i.pravatar.cc/64?u=asaldesign"; 

  if (!isLoggedIn) {
    // Optionally render a login button or nothing
    return null; 
  }

  if (!isSidebarExpanded) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Link href="#" aria-label="User profile">
                <Avatar className="h-full w-full">
                  {userImageUrl && <AvatarImage src={userImageUrl} alt={userName} />}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{userName}</p>
            {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
            <Link href="/auth/logout" className="mt-1 flex items-center text-xs text-destructive hover:underline">
              <LogOut className="mr-1.5 h-3 w-3" /> Log out
            </Link>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex w-full items-center gap-2.5">
      <Avatar className="h-8 w-8 shrink-0">
        {userImageUrl && <AvatarImage src={userImageUrl} alt={userName} />}
        <AvatarFallback>{userInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium leading-tight">{userName}</p>
        {userEmail && (
          <p className="truncate text-xs leading-tight text-muted-foreground">
            {userEmail}
          </p>
        )}
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="ml-auto shrink-0 rounded-lg">
              <Link href="/auth/logout">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Log out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 