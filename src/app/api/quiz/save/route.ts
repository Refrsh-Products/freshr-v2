import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Save a quiz to the database
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
    const { title, questions, difficulty } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid quiz data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        title,
        questions,
        difficulty: difficulty || "medium",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving quiz:", error);
      return NextResponse.json(
        { error: "Failed to save quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, quiz: data });
  } catch (error) {
    console.error("Quiz save error:", error);
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}

// Get user's quizzes
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

    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching quizzes:", error);
      return NextResponse.json(
        { error: "Failed to fetch quizzes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ quizzes: data });
  } catch (error) {
    console.error("Quiz fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// Delete a quiz
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Delete the quiz (cascade will delete attempts and favorites)
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting quiz:", error);
      return NextResponse.json(
        { error: "Failed to delete quiz" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
