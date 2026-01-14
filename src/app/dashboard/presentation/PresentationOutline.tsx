"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Home,
  Copy,
  Check,
  Clock,
  Layers,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { GeneratedPresentationData, SlideData } from "./PresentationForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

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

  const copyOutlineToClipboard = async () => {
    const outline = `# ${presentation.title}
${presentation.subtitle ? `\n*${presentation.subtitle}*\n` : ""}
Estimated Duration: ${presentation.estimatedDuration}

---

${presentation.slides
  .map(
    (slide, index) => `## Slide ${index + 1}: ${slide.title}

${slide.bulletPoints.map((point) => `- ${point}`).join("\n")}

${slide.speakerNotes ? `**Speaker Notes:** ${slide.speakerNotes}` : ""}
`
  )
  .join("\n---\n\n")}`;

    try {
      await navigator.clipboard.writeText(outline);
      setCopied(true);
      toast.success("Outline copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
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
        <Button variant="outline" size="sm" onClick={copyOutlineToClipboard}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Outline
            </>
          )}
        </Button>
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
              <ul className="space-y-3 flex-1">
                {currentSlide.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            {currentSlide.speakerNotes && (
              <CardContent className="border-t bg-muted/30 p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Speaker Notes
                    </p>
                    <p className="text-sm">{currentSlide.speakerNotes}</p>
                  </div>
                </div>
              </CardContent>
            )}
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
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
                <ul className="space-y-2 ml-11 mb-4">
                  {slide.bulletPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {slide.speakerNotes && (
                  <div className="ml-11 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Speaker Notes
                    </p>
                    <p className="text-sm">{slide.speakerNotes}</p>
                  </div>
                )}
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
    </div>
  );
}
