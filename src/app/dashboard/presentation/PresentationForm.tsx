"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PresentationFormProps {
  onPresentationGenerated: (presentation: GeneratedPresentationData) => void;
}

export interface SlideData {
  title: string;
  bulletPoints: string[];
  speakerNotes?: string;
}

export interface GeneratedPresentationData {
  id: string;
  title: string;
  subtitle?: string;
  slides: SlideData[];
  estimatedDuration: string;
  createdAt: string;
  userId: string;
}

export default function PresentationForm({
  onPresentationGenerated,
}: PresentationFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [numberOfSlides, setNumberOfSlides] = useState("10");
  const [style, setStyle] = useState<"professional" | "academic" | "casual">(
    "professional"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.type === "text/plain"
      ) {
        setFile(droppedFile);
        setText("");
      } else {
        toast.error("Please upload a PDF or text file");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.type === "text/plain"
      ) {
        setFile(selectedFile);
        setText("");
      } else {
        toast.error("Please upload a PDF or text file");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !text.trim()) {
      toast.error("Please upload a file or enter some text");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }
      formData.append("numberOfSlides", numberOfSlides);
      formData.append("style", style);

      const response = await fetch("/api/presentation/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate presentation");
      }

      toast.success("Presentation outline generated!");
      onPresentationGenerated(data.presentation);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate presentation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Upload Notes or Document</Label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
            dragActive
              ? "border-accent bg-accent/5"
              : file
              ? "border-accent/50 bg-accent/5"
              : "border-muted-foreground/25 hover:border-accent/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">
                Drag and drop your notes here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF and TXT files
              </p>
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
                id="presentation-file-upload"
              />
              <Button type="button" variant="outline" asChild>
                <label
                  htmlFor="presentation-file-upload"
                  className="cursor-pointer"
                >
                  Browse Files
                </label>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or paste your notes
          </span>
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="notes-input">Paste Your Notes</Label>
        <Textarea
          id="notes-input"
          placeholder="Paste your lecture notes, article, research, or any content you want to turn into a presentation..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value) setFile(null);
          }}
          className="min-h-[150px] resize-none"
          disabled={!!file}
        />
        <p className="text-xs text-muted-foreground">
          {text.length} characters{" "}
          {text.length < 100 && text.length > 0 && "(minimum 100 required)"}
        </p>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Number of Slides</Label>
          <Select value={numberOfSlides} onValueChange={setNumberOfSlides}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 Slides</SelectItem>
              <SelectItem value="8">8 Slides</SelectItem>
              <SelectItem value="10">10 Slides</SelectItem>
              <SelectItem value="15">15 Slides</SelectItem>
              <SelectItem value="20">20 Slides</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Presentation Style</Label>
          <Select
            value={style}
            onValueChange={(v) =>
              setStyle(v as "professional" | "academic" | "casual")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        variant="accent"
        size="lg"
        disabled={isLoading || (!file && !text.trim())}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Outline...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Presentation
          </>
        )}
      </Button>
    </form>
  );
}
