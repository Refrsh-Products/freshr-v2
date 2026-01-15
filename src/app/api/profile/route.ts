import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch user profile
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to fetch existing profile
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching profile:", error);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // If no profile exists, return default data from auth user
    if (!profile) {
      return NextResponse.json({
        profile: {
          user_id: user.id,
          first_name: user.user_metadata?.first_name || "",
          last_name:
            user.user_metadata?.last_name ||
            user.user_metadata?.full_name ||
            "",
          email: user.email || "",
          phone: "",
          university: "",
          occupation: "",
        },
        isNew: true,
      });
    }

    return NextResponse.json({ profile, isNew: false });
  } catch (error) {
    console.error("Error in profile GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create or update user profile
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
    const { first_name, last_name, email, phone, university, occupation } =
      body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from("user_profiles")
        .update({
          first_name,
          last_name,
          email,
          phone,
          university,
          occupation,
        })
        .eq("user_id", user.id)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          first_name,
          last_name,
          email,
          phone,
          university,
          occupation,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving profile:", result.error);
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: result.data, success: true });
  } catch (error) {
    console.error("Error in profile POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
