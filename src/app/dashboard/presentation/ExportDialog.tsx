"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { PresentationTheme } from "@/lib/presentation-export";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (theme: PresentationTheme) => void;
  isExporting: boolean;
}

const THEMES: {
  value: PresentationTheme;
  label: string;
  description: string;
  colors: { primary: string; text: string; accent: string };
}[] = [
  {
    value: "dark",
    label: "Dark",
    description: "Modern, tech-focused",
    colors: { primary: "#1E293B", text: "#F1F5F9", accent: "#06B6D4" },
  },
  {
    value: "white",
    label: "White",
    description: "Clean, minimal",
    colors: { primary: "#FFFFFF", text: "#1F2937", accent: "#3B82F6" },
  },
  {
    value: "classic",
    label: "Classic",
    description: "Traditional business",
    colors: { primary: "#1E3A8A", text: "#FFFFFF", accent: "#FBBF24" },
  },
  {
    value: "professional",
    label: "Professional",
    description: "Corporate, default",
    colors: { primary: "#2563EB", text: "#1E293B", accent: "#8B5CF6" },
  },
];

export default function ExportDialog({
  open,
  onOpenChange,
  onExport,
  isExporting,
}: ExportDialogProps) {
  const [theme, setTheme] = useState<PresentationTheme>("professional");

  const handleExport = () => {
    onExport(theme);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Export as PowerPoint</DialogTitle>
          <DialogDescription>
            Choose a theme for your presentation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={cn(
                    "border rounded-lg p-3 text-left transition-all hover:shadow-md",
                    theme === themeOption.value
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: themeOption.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: themeOption.colors.accent }}
                    />
                  </div>
                  <div className="font-medium text-sm">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>Export</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
