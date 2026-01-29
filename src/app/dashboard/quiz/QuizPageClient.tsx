"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuizForm, { GeneratedQuizData } from "./QuizForm";
import QuizPlayer from "./QuizPlayer";

export default function QuizPageClient() {
  const searchParams = useSearchParams();
  const isRetry = searchParams.get("retry") === "true";

  const [quiz, setQuiz] = useState<GeneratedQuizData | null>(null);
  const [mode, setMode] = useState<"create" | "play">("create");
  const [isRetryMode, setIsRetryMode] = useState(false);

  // Check for retry quiz in sessionStorage
  useEffect(() => {
    if (isRetry) {
      const retryQuizData = sessionStorage.getItem("retryQuiz");
      if (retryQuizData) {
        try {
          const parsedQuiz = JSON.parse(retryQuizData);
          setQuiz({
            id: parsedQuiz.id,
            title: parsedQuiz.title,
            questions: parsedQuiz.questions,
            difficulty: parsedQuiz.difficulty,
            createdAt: parsedQuiz.createdAt,
            userId: "",
          });
          setMode("play");
          setIsRetryMode(true);
          // Clear the sessionStorage
          sessionStorage.removeItem("retryQuiz");
        } catch (error) {
          console.error("Error parsing retry quiz:", error);
        }
      }
    }
  }, [isRetry]);

  const handleQuizGenerated = (generatedQuiz: GeneratedQuizData) => {
    setQuiz(generatedQuiz);
    setMode("play");
    setIsRetryMode(false);
  };

  const handleReset = () => {
    setQuiz(null);
    setMode("create");
    setIsRetryMode(false);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/quiz/saved">
                <BookOpen className="mr-2 h-4 w-4" />
                Past Quizzes
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {mode === "create" ? (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Generate Quiz</h1>
            <p className="text-muted-foreground mb-8">
              Create interactive quizzes from your content
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Create Your Quiz</CardTitle>
                <CardDescription>
                  Upload a document or paste text to generate a quiz with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizForm onQuizGenerated={handleQuizGenerated} />
              </CardContent>
            </Card>
          </div>
        ) : quiz ? (
          <QuizPlayer quiz={quiz} onReset={handleReset} isRetry={isRetryMode} />
        ) : null}
      </main>
    </div>
  );
}
