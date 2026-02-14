"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Timer,
  EyeOff,
  AlertTriangle,
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

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function QuizPlayer({
  quiz,
  onReset,
  isRetry = false,
}: QuizPlayerProps) {
  // Core quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLateSubmission, setIsLateSubmission] = useState(false);

  // Persistence
  const [savedQuizId, setSavedQuizId] = useState<string | null>(
    isRetry ? quiz.id : null,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Timer state
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!quiz.timedConfig);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const submitCalledRef = useRef(false);
  const startTimeRef = useRef<number>(Date.now());

  const isTimed = !!quiz.timedConfig;

  // ── Initialise timed session on mount ──────────────────────────────────────
  useEffect(() => {
    if (!isTimed) return;

    const init = async () => {
      setIsInitializing(true);
      try {
        let quizIdForSession = savedQuizId;

        // For a brand-new quiz we must save it first so we get a real DB id
        if (!isRetry && !savedQuizId) {
          const saveRes = await fetch("/api/quiz/save", {
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
          if (!saveRes.ok) throw new Error("Failed to save quiz");
          const { quiz: savedQuiz } = await saveRes.json();
          quizIdForSession = savedQuiz.id;
          setSavedQuizId(savedQuiz.id);
        }

        // Create the server-side session
        const sessionRes = await fetch("/api/quiz/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quizIdForSession,
            allocatedTimeSeconds: quiz.timedConfig!.allocatedTimeSeconds,
          }),
        });
        if (!sessionRes.ok) throw new Error("Failed to start session");
        const sessionData = await sessionRes.json();

        setSessionId(sessionData.sessionId);
        setSessionExpiry(new Date(sessionData.expiresAt));
        setTimeRemaining(
          Math.floor(
            (new Date(sessionData.expiresAt).getTime() - Date.now()) / 1000,
          ),
        );
      } catch (err) {
        console.error("Failed to initialise timed session:", err);
        toast.error("Could not start timed session. Quiz will be untimed.");
      } finally {
        setIsInitializing(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Countdown tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionExpiry) return;

    const tick = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((sessionExpiry.getTime() - Date.now()) / 1000),
      );
      setTimeRemaining(remaining);

      if (remaining === 0 && !timerExpired && !submitCalledRef.current) {
        setTimerExpired(true);
        // auto-submit handled in the timerExpired effect below
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [sessionExpiry, timerExpired]);

  // ── Auto-submit when timer expires ────────────────────────────────────────
  const handleSubmitQuiz = useCallback(
    async (auto = false) => {
      if (submitCalledRef.current) return;
      submitCalledRef.current = true;

      if (auto) {
        toast.warning("Time's up! Submitting your quiz…");
      }

      setIsSaving(true);

      const results = Object.entries(answers).map(([idx, selected]) => ({
        questionIndex: parseInt(idx),
        selectedAnswer: selected,
        isCorrect: selected === quiz.questions[parseInt(idx)].correctAnswer,
      }));

      const correctCount = results.filter((r) => r.isCorrect).length;
      const scorePercentage = Math.round(
        (correctCount / quiz.questions.length) * 100,
      );
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

      try {
        let quizIdToUse = savedQuizId;

        // If non-timed new quiz, save quiz first
        if (!isRetry && !savedQuizId) {
          const saveRes = await fetch("/api/quiz/save", {
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
          if (!saveRes.ok) throw new Error("Failed to save quiz");
          const { quiz: savedQuiz } = await saveRes.json();
          quizIdToUse = savedQuiz.id;
          setSavedQuizId(savedQuiz.id);
        }

        // Build a full answers array — unanswered questions get -1
        const fullAnswers = quiz.questions.map((q, idx) => {
          const selected = answers[idx] ?? -1;
          return {
            questionIndex: idx,
            selectedAnswer: selected,
            isCorrect: selected === q.correctAnswer,
          };
        });

        const attemptRes = await fetch("/api/quiz/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quizIdToUse,
            score: correctCount,
            totalQuestions: quiz.questions.length,
            percentage: scorePercentage,
            timeTakenSeconds: timeTaken,
            answers: fullAnswers,
            sessionId: sessionId || undefined,
          }),
        });

        if (!attemptRes.ok) throw new Error("Failed to save attempt");

        const attemptData = await attemptRes.json();
        if (attemptData.isLateSubmission) {
          setIsLateSubmission(true);
        }

        toast.success("Quiz results saved!");
      } catch (err) {
        console.error("Error saving quiz:", err);
        toast.error("Failed to save results");
      } finally {
        setIsSaving(false);
        setIsComplete(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answers, savedQuizId, sessionId, isRetry],
  );

  useEffect(() => {
    if (timerExpired && !submitCalledRef.current) {
      handleSubmitQuiz(true);
    }
  }, [timerExpired, handleSubmitQuiz]);

  // ── Favorites ──────────────────────────────────────────────────────────────
  const handleFavoriteToggle = async () => {
    if (!savedQuizId || isFavoriting) return;
    setIsFavoriting(true);
    try {
      if (isFavorited) {
        const res = await fetch(`/api/quiz/favorites?quizId=${savedQuizId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        const res = await fetch("/api/quiz/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: savedQuizId }),
        });
        if (!res.ok) throw new Error();
        setIsFavorited(true);
        toast.success("Added to favorites!");
      }
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setIsFavoriting(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(
    (answeredCount / quiz.questions.length) * 100,
  );
  const currentQuestion = quiz.questions[currentQuestionIndex];

  // ── Loading screen while initialising timed session ───────────────────────
  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Starting timed session…</p>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (isComplete) {
    const results = quiz.questions.map((q, idx) => {
      const selected = answers[idx] ?? -1;
      return {
        questionIndex: idx,
        selectedAnswer: selected,
        isCorrect: selected === q.correctAnswer,
        skipped: selected === -1,
      };
    });
    const correctCount = results.filter((r) => r.isCorrect).length;
    const scorePercentage = Math.round(
      (correctCount / quiz.questions.length) * 100,
    );

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
                      isFavorited && "fill-red-500 text-red-500",
                    )}
                  />
                )}
              </Button>
            )}
          </div>
          <CardTitle className="text-3xl">Quiz Complete! 🎉</CardTitle>

          {isSaving && (
            <span className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving results…
            </span>
          )}

          {isLateSubmission && (
            <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-600 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Submitted after the time limit
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center py-6">
            <div
              className={cn(
                "text-7xl font-bold mb-2",
                scorePercentage >= 70
                  ? "text-green-500"
                  : scorePercentage >= 50
                    ? "text-yellow-500"
                    : "text-red-500",
              )}
            >
              {scorePercentage}%
            </div>
            <p className="text-xl text-muted-foreground">
              {correctCount} out of {quiz.questions.length} correct
            </p>
            {answeredCount < quiz.questions.length && (
              <p className="text-sm text-muted-foreground mt-1">
                ({quiz.questions.length - answeredCount} question
                {quiz.questions.length - answeredCount > 1 ? "s" : ""} skipped)
              </p>
            )}
          </div>

          {/* Question summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Question Summary</h3>
            <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
              {quiz.questions.map((q, index) => {
                const result = results[index];
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      result.skipped
                        ? "bg-muted/50"
                        : result.isCorrect
                          ? "bg-green-500/10"
                          : "bg-red-500/10",
                    )}
                  >
                    {result.skipped ? (
                      <span className="h-5 w-5 rounded-full bg-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground mt-0.5 shrink-0">
                        –
                      </span>
                    ) : result.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{q.question}</p>
                      {!result.skipped && !result.isCorrect && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">Correct:</span>{" "}
                          {q.options[q.correctAnswer]}
                        </p>
                      )}
                      {result.skipped && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Not answered — correct: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

  // ── Quiz player ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold truncate">{quiz.title}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-muted-foreground">
              {answeredCount}/{quiz.questions.length} answered
            </span>

            {/* Timer badge */}
            {isTimed && timeRemaining !== null && (
              <button
                onClick={() => setShowTimer((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-medium border transition-all",
                  showTimer
                    ? timeRemaining <= 60
                      ? "border-red-500 bg-red-500/10 text-red-600 animate-pulse"
                      : "border-border bg-muted text-foreground"
                    : "border-border bg-muted text-muted-foreground",
                )}
                title={showTimer ? "Hide timer" : "Show timer"}
              >
                {showTimer ? (
                  <>
                    <Timer className="h-3.5 w-3.5" />
                    {formatTime(timeRemaining)}
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span className="text-xs">Timer hidden</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Two-column layout: question left, grid right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-4 items-start">
        {/* Question card */}
        <Card className="flex flex-col max-h-[calc(100vh-240px)]">
          <CardHeader className="shrink-0 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span className="font-medium">Q{currentQuestionIndex + 1}</span>
              <span>/</span>
              <span>{quiz.questions.length}</span>
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: index,
                      }))
                    }
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question number grid */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Questions
          </p>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
            {quiz.questions.map((_, index) => {
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    "aspect-square rounded-md text-sm font-medium transition-all border-2",
                    isCurrent
                      ? "border-primary ring-2 ring-primary/30 bg-primary/10 text-primary"
                      : isAnswered
                        ? "border-green-500 bg-green-500/15 text-green-700 hover:bg-green-500/25"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
                  )}
                  title={`Question ${index + 1}${isAnswered ? " (answered)" : ""}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm border-2 border-green-500 bg-green-500/15 inline-block" />
              Answered
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm border-2 border-border bg-muted/50 inline-block" />
              Unanswered
            </div>
          </div>

          {/* Submit button (always visible in sidebar) */}
          <Button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={isSaving || Object.keys(answers).length === 0}
            variant="hero"
            size="sm"
            className="w-full mt-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        </div>
      </div>

      {/* Navigation row */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentQuestionIndex((i) =>
              Math.min(quiz.questions.length - 1, i + 1),
            )
          }
          disabled={currentQuestionIndex === quiz.questions.length - 1}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < quiz.questions.length ? (
                <>
                  You have{" "}
                  <span className="font-semibold text-foreground">
                    {quiz.questions.length - answeredCount} unanswered{" "}
                    {quiz.questions.length - answeredCount === 1
                      ? "question"
                      : "questions"}
                  </span>
                  . Unanswered questions will be marked incorrect. Are you sure
                  you want to submit?
                </>
              ) : (
                "You've answered all questions. Are you sure you want to submit?"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmitQuiz(false)}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
