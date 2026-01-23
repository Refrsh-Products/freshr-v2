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
import { createClient } from "@/lib/supabase/client";

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
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [numberOfSlides, setNumberOfSlides] = useState("10");
  const [style, setStyle] = useState<"professional" | "academic" | "casual">(
    "professional",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const isValidFileType = (file: File) => {
    return file.type === "application/pdf" || file.type === "text/plain";
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(isValidFileType);
      const invalidCount = droppedFiles.length - validFiles.length;

      if (invalidCount > 0) {
        toast.error(
          `${invalidCount} file(s) skipped. Only PDF and TXT files are supported.`,
        );
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setText("");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(isValidFileType);
      const invalidCount = selectedFiles.length - validFiles.length;

      if (invalidCount > 0) {
        toast.error(
          `${invalidCount} file(s) skipped. Only PDF and TXT files are supported.`,
        );
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setText("");
      }
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTotalSize = () => {
    return files.reduce((sum, file) => sum + file.size, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && !text.trim()) {
      toast.error("Please upload files or enter some text");
      return;
    }

    setIsLoading(true);
    setUploadProgress("");

    try {
      const supabase = createClient();

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to generate presentations");
        setIsLoading(false);
        return;
      }

      const uploadedFiles: Array<{
        fileName: string;
        fileType: string;
        filePath: string;
      }> = [];

      if (files.length > 0) {
        // Upload all files to Supabase Storage
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading file ${i + 1} of ${files.length}...`);

          const fileExt = file.name.split(".").pop();
          const uniqueFileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("presentation-files")
              .upload(uniqueFileName, file, {
                cacheControl: "3600",
                upsert: false,
              });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(`Failed to upload ${file.name}. Please try again.`);
          }

          uploadedFiles.push({
            fileName: file.name,
            fileType: file.type,
            filePath: uploadData.path,
          });
        }
      }

      setUploadProgress("Generating presentation...");

      // Send metadata to the API
      const response = await fetch("/api/presentation/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: uploadedFiles.length > 0 ? uploadedFiles : null,
          text: text || null,
          numberOfSlides: parseInt(numberOfSlides),
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate presentation");
      }

      toast.success("Presentation outline generated!");
      setFiles([]);
      setText("");
      onPresentationGenerated(data.presentation);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate presentation",
      );
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Upload Notes or Documents</Label>
          {files.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFiles}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
            dragActive
              ? "border-accent bg-accent/5"
              : files.length > 0
                ? "border-accent/50 bg-accent/5"
                : "border-muted-foreground/25 hover:border-accent/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-base font-medium mb-1">
              Drag and drop your files here
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Supports multiple PDF and TXT files
            </p>
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
              id="presentation-file-upload"
              multiple
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <label
                htmlFor="presentation-file-upload"
                className="cursor-pointer"
              >
                Browse Files
              </label>
            </Button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </span>
              <span>Total: {formatFileSize(getTotalSize())}</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
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
            if (e.target.value) setFiles([]);
          }}
          className="min-h-[150px] resize-none"
          disabled={files.length > 0}
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
        disabled={isLoading || (files.length === 0 && !text.trim())}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {uploadProgress || "Processing..."}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Presentation
          </>
        )}
      </Button>

      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-2xl p-8 shadow-lg max-w-sm w-full mx-4 text-center">
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Generating Your Presentation
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {uploadProgress ||
                "AI is analyzing your content and creating slides..."}
            </p>
            <div className="flex items-center justify-center gap-1">
              <span
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
