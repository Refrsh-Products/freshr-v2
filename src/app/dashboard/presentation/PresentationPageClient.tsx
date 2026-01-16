"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PresentationForm, {
  GeneratedPresentationData,
} from "./PresentationForm";
import PresentationOutline from "./PresentationOutline";

export default function PresentationPageClient() {
  const [presentation, setPresentation] =
    useState<GeneratedPresentationData | null>(null);
  const [mode, setMode] = useState<"create" | "view">("create");

  const handlePresentationGenerated = (
    generatedPresentation: GeneratedPresentationData
  ) => {
    setPresentation(generatedPresentation);
    setMode("view");
  };

  const handleReset = () => {
    setPresentation(null);
    setMode("create");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/home">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FRESHR
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {mode === "create" ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Generate Presentation</h1>
            <p className="text-muted-foreground mb-8">
              Create presentation outlines from your notes
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Create Your Presentation</CardTitle>
                <CardDescription>
                  Upload notes or paste text to generate a presentation outline
                  with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PresentationForm
                  onPresentationGenerated={handlePresentationGenerated}
                />
              </CardContent>
            </Card>
          </div>
        ) : presentation ? (
          <PresentationOutline
            presentation={presentation}
            onReset={handleReset}
          />
        ) : null}
      </main>
    </div>
  );
}
