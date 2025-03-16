"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full border-healthBlue-700/30 dark:border-healthBlue-500/20">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-healthBlue-700 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-healthBlue-500 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-healthBlue-700/20 dark:border-healthBlue-700/20 dark:bg-healthBlue-900">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="text-healthBlue-900 hover:text-healthBlue-950 hover:bg-healthBlue-200/50 dark:text-healthBlue-200 dark:hover:bg-healthBlue-700"
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="text-healthBlue-900 hover:text-healthBlue-950 hover:bg-healthBlue-200/50 dark:text-healthBlue-200 dark:hover:bg-healthBlue-700"
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="text-healthBlue-900 hover:text-healthBlue-950 hover:bg-healthBlue-200/50 dark:text-healthBlue-200 dark:hover:bg-healthBlue-700"
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 