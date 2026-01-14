import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Get analytics data for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all attempts for this user
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*, quiz:quizzes(title)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalQuizzesTaken = attempts?.length || 0;
    const totalQuestionsAnswered =
      attempts?.reduce((sum, a) => sum + a.total_questions, 0) || 0;
    const averageScore =
      totalQuizzesTaken > 0
        ? Math.round(
            attempts!.reduce((sum, a) => sum + a.percentage, 0) /
              totalQuizzesTaken
          )
        : 0;
    const bestScore =
      totalQuizzesTaken > 0
        ? Math.max(...attempts!.map((a) => a.percentage))
        : 0;

    // Score distribution
    const scoreRanges = [
      { range: "0-20%", min: 0, max: 20, count: 0 },
      { range: "21-40%", min: 21, max: 40, count: 0 },
      { range: "41-60%", min: 41, max: 60, count: 0 },
      { range: "61-80%", min: 61, max: 80, count: 0 },
      { range: "81-100%", min: 81, max: 100, count: 0 },
    ];

    attempts?.forEach((attempt) => {
      const range = scoreRanges.find(
        (r) => attempt.percentage >= r.min && attempt.percentage <= r.max
      );
      if (range) range.count++;
    });

    const scoreDistribution = scoreRanges.map(({ range, count }) => ({
      range,
      count,
    }));

    // Performance over time (last 30 days, grouped by date)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttempts =
      attempts?.filter((a) => new Date(a.completed_at) >= thirtyDaysAgo) || [];

    const dateMap = new Map<string, { total: number; count: number }>();
    recentAttempts.forEach((attempt) => {
      const date = new Date(attempt.completed_at).toISOString().split("T")[0];
      const existing = dateMap.get(date) || { total: 0, count: 0 };
      dateMap.set(date, {
        total: existing.total + attempt.percentage,
        count: existing.count + 1,
      });
    });

    const performanceOverTime = Array.from(dateMap.entries())
      .map(([date, { total, count }]) => ({
        date,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get recent attempts (limited to 10) with proper format
    const recentAttemptsFormatted = (attempts || []).slice(0, 10).map((a) => ({
      id: a.id,
      quizTitle: a.quiz?.title || "Untitled Quiz",
      score: a.percentage,
      timeTaken: a.time_taken_seconds || 0,
      completedAt: a.completed_at,
    }));

    // Get unique quizzes count
    const { count: totalQuizzes } = await supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    return NextResponse.json({
      totalQuizzes: totalQuizzes || 0,
      totalAttempts: totalQuizzesTaken,
      averageScore,
      topicBreakdown: [], // No topic tracking yet
      recentAttempts: recentAttemptsFormatted,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
