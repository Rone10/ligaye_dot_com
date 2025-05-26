'use client';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarThemeToggleProps {
  isSidebarExpanded?: boolean;
}

export function SidebarThemeToggle({ isSidebarExpanded }: SidebarThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (!isSidebarExpanded) {
    // Render only icons in a column when collapsed
    return (
      <div className="flex flex-col items-center space-y-1">
        <Button
          variant={theme === 'light' ? "secondary" : "ghost"} 
          size="icon"
          onClick={() => setTheme('light')}
          className="h-8 w-8 rounded-md"
          aria-label="Set light theme"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? "secondary" : "ghost"} 
          size="icon"
          onClick={() => setTheme('dark')}
          className="h-8 w-8 rounded-md"
          aria-label="Set dark theme"
        >
          <Moon className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Render full toggle buttons when expanded
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('light')}
        className={cn(
          "flex h-8 w-full items-center justify-center gap-2 rounded-[5px] px-2 text-xs font-medium",
          theme === 'light'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
        )}
      >
        <Sun className="h-4 w-4 shrink-0" />
        <span>Light</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('dark')}
        className={cn(
          "flex h-8 w-full items-center justify-center gap-2 rounded-[5px] px-2 text-xs font-medium",
          theme === 'dark'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
        )}
      >
        <Moon className="h-4 w-4 shrink-0" />
        <span>Dark</span>
      </Button>
    </div>
  );
} 