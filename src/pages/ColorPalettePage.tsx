import React from "react";
import Navbar from "@/components/layout/Navbar";
import { ColorPaletteShowcase } from "@/components/ui/color-palette-showcase";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"


const ColorPalettePage = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 px-4 mx-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-healthBlue-950 dark:text-healthBlue-200">HealthMetrics Color Palette</h1>
          <p className="text-muted-foreground mb-6">
            The blue color palette used throughout the HealthMetrics application, based on the requested design.
          </p>
          
          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 gap-2 border-healthBlue-700/30 dark:border-healthBlue-500/30"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
          </div>
          
          <ColorPaletteShowcase />
          
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-bold text-healthBlue-950 dark:text-healthBlue-200">Usage Guidelines</h2>
            <div>
              <h3 className="font-medium mb-2 text-healthBlue-900 dark:text-healthBlue-500">Light Mode</h3>
              <ul className="list-disc ml-5 space-y-2 text-healthBlue-900 dark:text-healthBlue-200">
                <li>Primary actions: <code className="bg-healthBlue-200/50 px-2 py-1 rounded text-healthBlue-700">healthBlue-700</code></li>
                <li>Text: <code className="bg-healthBlue-200/50 px-2 py-1 rounded text-healthBlue-700">healthBlue-950</code> for headings, <code className="bg-healthBlue-200/50 px-2 py-1 rounded text-healthBlue-700">healthBlue-900</code> for body text</li>
                <li>Backgrounds: White with <code className="bg-healthBlue-200/50 px-2 py-1 rounded text-healthBlue-700">healthBlue-200</code> for accents</li>
                <li>Icons: <code className="bg-healthBlue-200/50 px-2 py-1 rounded text-healthBlue-700">healthBlue-700</code></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-healthBlue-900 dark:text-healthBlue-500">Dark Mode</h3>
              <ul className="list-disc ml-5 space-y-2 text-healthBlue-900 dark:text-healthBlue-200">
                <li>Background: <code className="bg-healthBlue-900/20 px-2 py-1 rounded dark:text-healthBlue-200">healthBlue-950</code></li>
                <li>Cards/Components: <code className="bg-healthBlue-900/20 px-2 py-1 rounded dark:text-healthBlue-200">healthBlue-900</code></li>
                <li>Text: <code className="bg-healthBlue-900/20 px-2 py-1 rounded dark:text-healthBlue-200">healthBlue-200</code> for primary text</li>
                <li>Accents: <code className="bg-healthBlue-900/20 px-2 py-1 rounded dark:text-healthBlue-200">healthBlue-500</code> and <code className="bg-healthBlue-900/20 px-2 py-1 rounded dark:text-healthBlue-200">healthBlue-700</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalettePage; 