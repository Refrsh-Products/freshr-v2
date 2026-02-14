import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Start a timed quiz session — records server-side start time
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
    const { quizId, allocatedTimeSeconds } = body;

    if (!quizId || !allocatedTimeSeconds || allocatedTimeSeconds < 60) {
      return NextResponse.json(
        { error: "Invalid session data. quizId and allocatedTimeSeconds (min 60) are required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("quiz_sessions")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        allocated_time_seconds: allocatedTimeSeconds,
        // started_at defaults to NOW() on the server
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating quiz session:", error);
      return NextResponse.json(
        { error: "Failed to create quiz session" },
        { status: 500 }
      );
    }

    const expiresAt = new Date(
      new Date(data.started_at).getTime() + allocatedTimeSeconds * 1000
    ).toISOString();

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      startedAt: data.started_at,
      allocatedTimeSeconds: data.allocated_time_seconds,
      expiresAt,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz session" },
      { status: 500 }
    );
  }
}

// Get remaining time for an active session
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
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const expiresAtMs =
      new Date(data.started_at).getTime() +
      data.allocated_time_seconds * 1000;
    const timeRemainingSeconds = Math.max(
      0,
      Math.floor((expiresAtMs - Date.now()) / 1000)
    );

    return NextResponse.json({
      sessionId: data.id,
      startedAt: data.started_at,
      allocatedTimeSeconds: data.allocated_time_seconds,
      expiresAt: new Date(expiresAtMs).toISOString(),
      timeRemainingSeconds,
      isExpired: timeRemainingSeconds === 0,
      isCompleted: data.is_completed,
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
