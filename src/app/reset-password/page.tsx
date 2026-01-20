"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ResetState = "loading" | "ready" | "submitting" | "success" | "error";

function ResetPasswordContent() {
  const router = useRouter();
  const [state, setState] = useState<ResetState>("loading");
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
        // User is already authenticated via recovery
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
        setError(errorDescription || "Invalid or expired reset link.");
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
            "Failed to verify your reset link. The link may have expired."
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
            window.location.pathname
          );
          return;
        }
      }

      // For recovery type with token_hash, use verifyOtp
      if (type === "recovery" && tokenHash) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (error) {
          console.error("OTP verification error:", error);
          setError("Failed to verify reset link. The link may have expired.");
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }
      }

      // For recovery type with access_token (short token hash), use verifyOtp
      if (type === "recovery" && accessToken && !accessToken.includes(".")) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: "recovery",
        });

        if (error) {
          console.error("OTP verification error:", error);
          setError("Failed to verify reset link. The link may have expired.");
          setState("error");
          return;
        }

        if (data.user) {
          setUserEmail(data.user.email || "");
          setState("ready");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }
      }

      // No valid authentication found
      setError(
        "No valid reset link found. Please request a new password reset email."
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

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      setState("ready");
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
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
            <h1 className="text-2xl font-bold mb-4">Reset Link Error</h1>
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
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Password Reset!</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully updated. Redirecting you to
              the app...
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - show password form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FRESHR
            </span>
          </Link>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground">
            {userEmail ? (
              <>
                Enter a new password for{" "}
                <span className="font-medium text-foreground">{userEmail}</span>
              </>
            ) : (
              "Enter your new password below"
            )}
          </p>
        </div>

        {/* Password Form */}
        <div className="card-elevated p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your new password"
                  className="pr-10"
                  required
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
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-muted-foreground" />
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm your new password"
                  className="pr-10"
                  required
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

            {/* Password Requirements */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Password must contain:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li
                  className={
                    formData.password.length >= 8 ? "text-green-600" : ""
                  }
                >
                  • At least 8 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One uppercase letter
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One lowercase letter
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.password) ? "text-green-600" : ""
                  }
                >
                  • One number
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={state === "submitting"}
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
