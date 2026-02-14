import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Save a quiz attempt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      quizId,
      score,
      totalQuestions,
      percentage,
      answers,
      timeTakenSeconds,
      sessionId,
    } = body;

    if (
      !quizId ||
      score === undefined ||
      !totalQuestions ||
      percentage === undefined ||
      !answers
    ) {
      return NextResponse.json(
        { error: "Invalid attempt data" },
        { status: 400 }
      );
    }

    // Server-side timing validation for timed sessions
    const GRACE_PERIOD_SECONDS = 30;
    let isLateSubmission = false;

    if (sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: "Invalid session" },
          { status: 400 }
        );
      }

      const deadlineMs =
        new Date(session.started_at).getTime() +
        (session.allocated_time_seconds + GRACE_PERIOD_SECONDS) * 1000;

      if (Date.now() > deadlineMs) {
        isLateSubmission = true;
      }

      // Mark the session as completed
      await supabase
        .from("quiz_sessions")
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq("id", sessionId);
    }

    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        total_questions: totalQuestions,
        percentage,
        answers,
        time_taken_seconds: timeTakenSeconds || null,
        session_id: sessionId || null,
        is_late_submission: isLateSubmission,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving attempt:", error);
      return NextResponse.json(
        { error: "Failed to save quiz attempt" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, attempt: data, isLateSubmission });
  } catch (error) {
    console.error("Attempt save error:", error);
    return NextResponse.json(
      { error: "Failed to save quiz attempt" },
      { status: 500 }
    );
  }
}

// Get user's quiz attempts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const quizId = searchParams.get("quizId");

    let query = supabase
      .from("quiz_attempts")
      .select("*, quiz:quizzes(*)")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (quizId) {
      query = query.eq("quiz_id", quizId);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching attempts:", error);
      return NextResponse.json(
        { error: "Failed to fetch attempts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ attempts: data });
  } catch (error) {
    console.error("Attempt fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
