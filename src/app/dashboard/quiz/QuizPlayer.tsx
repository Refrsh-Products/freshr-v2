"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Home,
  Heart,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { GeneratedQuizData } from "./QuizForm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuizPlayerProps {
  quiz: GeneratedQuizData;
  onReset: () => void;
  isRetry?: boolean;
}

interface QuizResult {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

export default function QuizPlayer({
  quiz,
  onReset,
  isRetry = false,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(
    isRetry ? quiz.id : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // Save quiz results when complete
  useEffect(() => {
    if (isComplete && !isSaving) {
      if (isRetry) {
        // For retry, just save the attempt
        saveAttemptOnly();
      } else if (!savedQuizId) {
        // For new quiz, save quiz and attempt
        saveQuizResults();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const saveAttemptOnly = async () => {
    if (!savedQuizId) return;

    setIsSaving(true);
    try {
      const correctCount = results.filter((r) => r.isCorrect).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      const attemptResponse = await fetch("/api/quiz/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: savedQuizId,
          score: correctCount,
          totalQuestions: quiz.questions.length,
          percentage: score,
          timeTakenSeconds: timeTaken,
          answers: results.map((r) => ({
            questionIndex: r.questionIndex,
            selectedAnswer: r.selectedAnswer,
            isCorrect: r.isCorrect,
          })),
        }),
      });

      if (!attemptResponse.ok) {
        throw new Error("Failed to save attempt");
      }

      toast.success("Quiz results saved!");
    } catch (error) {
      console.error("Error saving attempt:", error);
      toast.error("Failed to save results");
    } finally {
      setIsSaving(false);
    }
  };

  const saveQuizResults = async () => {
    setIsSaving(true);
    try {
      // Calculate score
      const correctCount = results.filter((r) => r.isCorrect).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // First, save the quiz
      const quizResponse = await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          questions: quiz.questions,
        }),
      });

      if (!quizResponse.ok) {
        throw new Error("Failed to save quiz");
      }

      const { quiz: savedQuiz } = await quizResponse.json();
      setSavedQuizId(savedQuiz.id);

      // Then save the attempt
      const attemptResponse = await fetch("/api/quiz/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: savedQuiz.id,
          score: correctCount,
          totalQuestions: quiz.questions.length,
          percentage: score,
          timeTakenSeconds: timeTaken,
          answers: results.map((r) => ({
            questionIndex: r.questionIndex,
            selectedAnswer: r.selectedAnswer,
            isCorrect: r.isCorrect,
          })),
        }),
      });

      if (!attemptResponse.ok) {
        throw new Error("Failed to save attempt");
      }

      toast.success("Quiz results saved!");
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Failed to save results");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!savedQuizId || isFavoriting) return;

    setIsFavoriting(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(
          `/api/quiz/favorites?quizId=${savedQuizId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to remove from favorites");
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const response = await fetch("/api/quiz/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: savedQuizId }),
        });
        if (!response.ok) throw new Error("Failed to add to favorites");
        setIsFavorited(true);
        toast.success("Added to favorites!");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return; // Don't allow changing answer after submission
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setResults([
      ...results,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswer,
        isCorrect,
      },
    ]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const scorePercentage = Math.round(
    (correctAnswers / quiz.questions.length) * 100
  );

  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-end">
            {savedQuizId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteToggle}
                disabled={isFavoriting}
                className="text-muted-foreground hover:text-red-500"
              >
                {isFavoriting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isFavorited && "fill-red-500 text-red-500"
                    )}
                  />
                )}
              </Button>
            )}
          </div>
          <CardTitle className="text-3xl">Quiz Complete! 🎉</CardTitle>
          <CardDescription className="text-lg">
            You&apos;ve finished the quiz
            {isSaving && (
              <span className="flex items-center justify-center gap-2 mt-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving results...
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center py-8">
            <div
              className={cn(
                "text-7xl font-bold mb-2",
                scorePercentage >= 70
                  ? "text-green-500"
                  : scorePercentage >= 50
                  ? "text-yellow-500"
                  : "text-red-500"
              )}
            >
              {scorePercentage}%
            </div>
            <p className="text-xl text-muted-foreground">
              {correctAnswers} out of {quiz.questions.length} correct
            </p>
          </div>

          {/* Results Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Question Summary</h3>
            {quiz.questions.map((q, index) => {
              const result = results.find((r) => r.questionIndex === index);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    result?.isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                  )}
                >
                  {result?.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{q.question}</p>
                    {!result?.isCorrect && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Quiz
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/home">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{quiz.title}</span>
          <span className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="flex flex-col max-h-[calc(100vh-200px)]">
        <CardHeader className="shrink-0">
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0">
          {/* Scrollable area for question and options */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected && !showResult && "border-primary bg-primary/10",
                      showCorrect && "border-green-500 bg-green-500/10",
                      showWrong && "border-red-500 bg-red-500/10",
                      !isSelected && !showCorrect && !showWrong && "border-border",
                      showResult && "cursor-default"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                          isSelected &&
                            !showResult &&
                            "bg-primary text-primary-foreground",
                          showCorrect && "bg-green-500 text-white",
                          showWrong && "bg-red-500 text-white",
                          !isSelected && !showCorrect && !showWrong && "bg-muted"
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {showWrong && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation inside scrollable area */}
            {showResult && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                <p className="font-medium text-sm mb-1">Explanation:</p>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Actions - fixed at bottom */}
          <div className="shrink-0 border-t pt-4">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full"
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} className="w-full" size="lg">
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "See Results"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
