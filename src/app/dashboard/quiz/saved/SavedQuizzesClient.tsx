"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  Trophy,
  Trash2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedQuiz {
  id: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  difficulty: string;
  created_at: string;
  attempts_count?: number;
  best_score?: number;
  is_favorite?: boolean;
}

export default function SavedQuizzesClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/quiz/save");
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to load past quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    setDeletingId(quizId);
    try {
      const response = await fetch(`/api/quiz/save?quizId=${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quiz");
      setQuizzes(quizzes.filter((q) => q.id !== quizId));
      toast.success("Quiz deleted");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetryQuiz = (quiz: SavedQuiz) => {
    // Store quiz in sessionStorage and navigate to quiz player
    sessionStorage.setItem(
      "retryQuiz",
      JSON.stringify({
        id: quiz.id,
        title: quiz.title,
        questions: quiz.questions,
        difficulty: quiz.difficulty,
        createdAt: quiz.created_at,
        isRetry: true,
      })
    );
    router.push("/dashboard/quiz?retry=true");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FRESHR
              </span>
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading past quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FRESHR
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quiz">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Past Quizzes</h1>
            <p className="text-muted-foreground">
              Review and retry your previous quizzes
            </p>
          </div>
          <Button variant="outline" onClick={fetchQuizzes} disabled={isLoading}>
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Past Quizzes</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Complete a quiz to save it here. You can then revisit and retry
                it anytime.
              </p>
              <Button asChild>
                <Link href="/dashboard/quiz">Generate a Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                        {quiz.is_favorite && (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {quiz.questions.length} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(quiz.created_at)}
                        </span>
                        {quiz.attempts_count !== undefined &&
                          quiz.attempts_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5" />
                              {quiz.attempts_count} attempt
                              {quiz.attempts_count !== 1 && "s"}
                            </span>
                          )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        getDifficultyColor(quiz.difficulty)
                      )}
                    >
                      {quiz.difficulty || "medium"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {quiz.best_score !== undefined && quiz.best_score > 0 && (
                        <span className="text-green-500 font-medium">
                          Best: {quiz.best_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingId === quiz.id}
                          >
                            {deletingId === quiz.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete &quot;{quiz.title}
                              &quot; and all its attempt history. This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button onClick={() => handleRetryQuiz(quiz)}>
                        <Play className="mr-2 h-4 w-4" />
                        Retry Quiz
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
