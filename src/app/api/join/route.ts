import { NextRequest, NextResponse } from "next/server";

// Google Sheets API endpoint (using Google Apps Script Web App)
// You'll need to create a Google Apps Script and deploy it as a web app
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, transactionId } = body;

    // Validate required fields
    if (!email || !phone || !transactionId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate phone format (Bangladesh)
    const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Check if Google Script URL is configured
    if (!GOOGLE_SCRIPT_URL) {
      console.error("GOOGLE_SCRIPT_URL is not configured");
      // In development, just log and return success
      console.log("Form submission (dev mode):", {
        email,
        phone,
        transactionId,
      });
      return NextResponse.json({ success: true });
    }

    // Send data to Google Sheets via Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        phone,
        transactionId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save to Google Sheets");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing join request:", error);
    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
