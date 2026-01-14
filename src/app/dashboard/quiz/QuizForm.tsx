"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

interface QuizFormProps {
  onQuizGenerated: (quiz: GeneratedQuizData) => void;
}

export interface GeneratedQuizData {
  id: string;
  title: string;
  description?: string;
  topic?: string;
  difficulty?: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  createdAt: string;
  userId: string;
}

export default function QuizForm({ onQuizGenerated }: QuizFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
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
        setText(""); // Clear text when file is uploaded
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
        setText(""); // Clear text when file is uploaded
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
      formData.append("numberOfQuestions", numberOfQuestions);
      formData.append("difficulty", difficulty);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      toast.success("Quiz generated successfully!");
      onQuizGenerated(data.quiz);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Upload Document</Label>
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : file
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
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
                Drag and drop your file here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF and TXT files
              </p>
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Button type="button" variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
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
            Or paste text
          </span>
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="text-input">Paste Your Content</Label>
        <Textarea
          id="text-input"
          placeholder="Paste your notes, article, or any text content here..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value) setFile(null); // Clear file when text is entered
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
          <Label>Number of Questions</Label>
          <Select
            value={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Questions</SelectItem>
              <SelectItem value="5">5 Questions</SelectItem>
              <SelectItem value="10">10 Questions</SelectItem>
              <SelectItem value="15">15 Questions</SelectItem>
              <SelectItem value="20">20 Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) =>
              setDifficulty(v as "easy" | "medium" | "hard")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        variant="hero"
        size="lg"
        disabled={isLoading || (!file && !text.trim())}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Quiz
          </>
        )}
      </Button>
    </form>
  );
}
