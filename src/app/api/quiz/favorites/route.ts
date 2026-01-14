import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Add a quiz to favorites
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
    const { quizId } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("favorite_quizzes")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation - already favorited
        return NextResponse.json(
          { error: "Quiz already in favorites" },
          { status: 409 }
        );
      }
      console.error("Error adding favorite:", error);
      return NextResponse.json(
        { error: "Failed to add to favorites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, favorite: data });
  } catch (error) {
    console.error("Favorite add error:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    );
  }
}

// Get user's favorite quizzes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("favorite_quizzes")
      .select("*, quiz:quizzes(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching favorites:", error);
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorites: data });
  } catch (error) {
    console.error("Favorite fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// Remove from favorites
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

    const { error } = await supabase
      .from("favorite_quizzes")
      .delete()
      .eq("user_id", user.id)
      .eq("quiz_id", quizId);

    if (error) {
      console.error("Error removing favorite:", error);
      return NextResponse.json(
        { error: "Failed to remove from favorites" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Favorite remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
