"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  ArrowLeft,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnalyticsData } from "@/types";

export default function AnalyticsPageClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics");
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || "Something went wrong"}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your quiz performance and progress
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Quizzes created and saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attempts
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Quiz attempts completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                getScoreColor(analytics.averageScore)
              )}
            >
              {analytics.averageScore}%
            </div>
            <Progress
              value={analytics.averageScore}
              className={cn("mt-2 h-2", getScoreBg(analytics.averageScore))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageScore >= 70
                ? "Great!"
                : analytics.averageScore >= 50
                ? "Good"
                : "Keep Practicing"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topic Breakdown */}
      {analytics.topicBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance by Topic
            </CardTitle>
            <CardDescription>
              See how you perform across different topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topicBreakdown.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {topic.topic}
                    </span>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {topic.attempts} attempt{topic.attempts !== 1 && "s"}
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          getScoreColor(topic.avgScore)
                        )}
                      >
                        {topic.avgScore}%
                      </span>
                    </div>
                  </div>
                  <Progress value={topic.avgScore} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Attempts
          </CardTitle>
          <CardDescription>Your latest quiz attempts</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No quiz attempts yet</p>
              <p className="text-sm">
                Complete a quiz to see your results here
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/quiz">Take a Quiz</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        attempt.score >= 70
                          ? "bg-green-500/10"
                          : attempt.score >= 50
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                      )}
                    >
                      {attempt.score >= 70 ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : attempt.score >= 50 ? (
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{attempt.quizTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.completedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        getScoreColor(attempt.score)
                      )}
                    >
                      {attempt.score}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(attempt.timeTaken / 60)}m{" "}
                      {attempt.timeTaken % 60}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* No Data State */}
      {analytics.totalQuizzes === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start taking quizzes to see your analytics and track your progress
              over time.
            </p>
            <Button asChild>
              <Link href="/dashboard/quiz">Generate Your First Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
