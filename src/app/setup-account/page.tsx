"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SetupState = "loading" | "ready" | "submitting" | "success" | "error";

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SetupState>("loading");
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const supabase = createClient();

  useEffect(() => {
    handleTokenExchange();
  }, []);

  const handleTokenExchange = async () => {
    try {
      // Check if user is already logged in (token already exchanged)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // User is already authenticated
        setUserEmail(session.user.email || "");
        setState("ready");
        return;
      }

      // Check for hash parameters (Supabase sends tokens in URL hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");
      const tokenHash = hashParams.get("token_hash");

      // Check for error in hash first (e.g., expired token)
      const hashError = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      if (hashError) {
        setError(errorDescription || "Invalid or expired invitation link.");
        setState("error");
        return;
      }

      // If we have both access and refresh tokens (full JWT tokens), use setSession
      if (accessToken && refreshToken && accessToken.includes(".")) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Session error:", error);
          setError(
            "Failed to verify your invitation. The link may have expired.",
          );
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          return;
        }
      }

      // For invite type with access_token (short token hash), use verifyOtp
      if (type === "invite" && accessToken) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: "invite",
        });

        if (error) {
          console.error("OTP verification error:", error);
          setError("Failed to verify invitation. The link may have expired.");
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          return;
        }
      }

      // Check for token_hash parameter
      if (tokenHash && type === "invite") {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "invite",
        });

        if (error) {
          console.error("Token hash verification error:", error);
          setError("Failed to verify invitation. The link may have expired.");
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          return;
        }
      }

      // Check query params as fallback
      const queryToken = searchParams.get("token");
      const queryTokenHash = searchParams.get("token_hash");
      const queryType = searchParams.get("type");

      if ((queryToken || queryTokenHash) && queryType === "invite") {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: queryTokenHash || queryToken || "",
          type: "invite",
        });

        if (error) {
          console.error("Query token verification error:", error);
          setError("Failed to verify invitation. The link may have expired.");
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          return;
        }
      }

      // No valid authentication found
      setError(
        "No valid invitation found. Please use the link from your invitation email.",
      );
      setState("error");
    } catch (err) {
      console.error("Token exchange error:", err);
      setError("Something went wrong. Please try again or contact support.");
      setState("error");
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setState("submitting");

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setError(error.message);
        setState("ready");
        return;
      }

      setState("success");

      // Redirect to profile setup after a short delay
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      setError("Failed to set password. Please try again.");
      setState("ready");
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="card-elevated p-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Invitation Error</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a
                  href="mailto:heyrefrsh@gmail.com"
                  className="text-primary hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="card-elevated p-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              Account Setup Complete! 🎉
            </h1>
            <p className="text-muted-foreground mb-6">
              Your password has been set. Redirecting you to complete your
              profile...
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show password form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image
              src="/FRESHR-LOGO.png"
              alt="FRESHR"
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-2xl font-bold">FRESHR</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome to FRESHR!
          </h1>
          <p className="text-muted-foreground">
            Set up your password to complete your account
          </p>
        </div>

        {/* Form Card */}
        <div className="card-elevated p-6 sm:p-8">
          {/* Email Display */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">
              Your account email
            </p>
            <p className="font-medium">{userEmail}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={state === "submitting"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  disabled={state === "submitting"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={state === "submitting"}
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Having trouble?{" "}
          <a
            href="mailto:heyrefrsh@gmail.com"
            className="text-primary hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

// Loading fallback
function SetupAccountLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function SetupAccountPage() {
  return (
    <Suspense fallback={<SetupAccountLoading />}>
      <SetupAccountContent />
    </Suspense>
  );
}
