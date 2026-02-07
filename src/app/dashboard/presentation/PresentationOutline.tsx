"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Clock,
  Layers,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { GeneratedPresentationData } from "./PresentationForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ExportDialog from "./ExportDialog";
import { PresentationTheme } from "@/lib/presentation-export";

interface PresentationOutlineProps {
  presentation: GeneratedPresentationData;
  onReset: () => void;
}

export default function PresentationOutline({
  presentation,
  onReset,
}: PresentationOutlineProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "list">("slides");
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const currentSlide = presentation.slides[currentSlideIndex];

  const goToNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleExport = async (theme: PresentationTheme) => {
    setIsExporting(true);
    setExportDialogOpen(false);

    try {
      const response = await fetch("/api/presentation/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presentation,
          format: "pptx",
          theme,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PowerPoint downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PowerPoint. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{presentation.title}</h1>
          {presentation.subtitle && (
            <p className="text-muted-foreground">{presentation.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {presentation.estimatedDuration}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            {presentation.slides.length} slides
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "slides" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("slides")}
        >
          Slide View
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
        >
          List View
        </Button>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export as PowerPoint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {viewMode === "slides" ? (
        /* Slide View */
        <div className="space-y-4">
          {/* Slide Preview */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 min-h-[300px] flex flex-col">
              <div className="text-sm text-muted-foreground mb-2">
                Slide {currentSlideIndex + 1} of {presentation.slides.length}
              </div>
              <h2 className="text-2xl font-bold mb-6">{currentSlide.title}</h2>
              <div className="flex-1">
                {currentSlide.format === "bulletpoint" ? (
                  <ul className="space-y-3">
                    {currentSlide.content
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                          <span className="text-lg">
                            {point.replace(/^-\s*/, "")}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {currentSlide.content}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-1">
              {presentation.slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentSlideIndex
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              onClick={goToNextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* List View */
        <Accordion
          type="multiple"
          defaultValue={["slide-0"]}
          className="space-y-2"
        >
          {presentation.slides.map((slide, index) => (
            <AccordionItem
              key={index}
              value={`slide-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-medium">{slide.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="ml-11">
                  {slide.format === "bulletpoint" ? (
                    <ul className="space-y-2">
                      {String(slide.content || "")
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((point, pointIndex) => (
                          <li
                            key={pointIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                            <span>{point.replace(/^-\s*/, "")}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {String(slide.content || "")}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          New Presentation
        </Button>
        <Button className="flex-1" asChild>
          <Link href="/home">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}
