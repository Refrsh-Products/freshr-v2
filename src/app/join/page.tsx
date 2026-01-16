"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";

type FormState = "form" | "submitting" | "success";

export default function JoinPage() {
  const [formState, setFormState] = useState<FormState>("form");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    transactionId: "",
  });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePayment, setActivePayment] = useState<"bkash" | "nagad">(
    "bkash"
  );

  const paymentMethods = {
    bkash: {
      name: "bKash",
      number: "01735297191",
      color: "#E2136E",
      dialCode: "*247#",
      steps: [
        {
          text: (
            <>
              <strong className="text-foreground">*247#</strong> ডায়াল করে
              আপনার BKASH মোবাইল মেনুতে যান অথবা BKASH অ্যাপে যান।
            </>
          ),
        },
        {
          text: (
            <>
              <strong className="text-foreground">
                &quot;Send Money&quot;
              </strong>{" "}
              -এ ক্লিক করুন।
            </>
          ),
        },
        { text: <>প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুন:</> },
      ],
      stepsAfterNumber: [
        {
          text: (
            <>
              টাকার পরিমাণ: <strong className="text-foreground">250</strong>
            </>
          ),
        },
        { text: <>নিশ্চিত করতে এখন আপনার BKASH মোবাইল মেনু পিন লিখুন।</> },
        {
          text: (
            <>সবকিছু ঠিক থাকলে, আপনি BKASH থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।</>
          ),
        },
        {
          text: (
            <>
              এখন নিচের বক্সে আপনার{" "}
              <strong className="text-foreground">Transaction ID</strong> দিন।
            </>
          ),
        },
      ],
    },
    nagad: {
      name: "Nagad",
      number: "01234567890",
      color: "#F6921E",
      dialCode: "*167#",
      steps: [
        {
          text: (
            <>
              <strong className="text-foreground">*167#</strong> ডায়াল করে
              আপনার NAGAD মোবাইল মেনুতে যান অথবা অ্যাপে যান।
            </>
          ),
        },
        {
          text: (
            <>
              <strong className="text-foreground">
                &quot;Send Money&quot;
              </strong>{" "}
              এ ক্লিক করুন।
            </>
          ),
        },
        { text: <>প্রাপক নম্বর:</> },
      ],
      stepsAfterNumber: [
        {
          text: (
            <>
              পরিমাণ: <strong className="text-foreground">250</strong>
            </>
          ),
        },
        { text: <>পিন দিয়ে নিশ্চিত করুন।</> },
        { text: <>একটি নিশ্চিতকরণ SMS পাবেন।</> },
        {
          text: (
            <>
              এখন নিচের বক্সে আপনার{" "}
              <strong className="text-foreground">Transaction ID</strong> দিন।
            </>
          ),
        },
      ],
    },
  };

  const currentPayment = paymentMethods[activePayment];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentPayment.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.phone || !formData.transactionId) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Phone validation (Bangladesh format)
    const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid Bangladeshi phone number");
      return;
    }

    setFormState("submitting");

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      setFormState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setFormState("form");
    }
  };

  if (formState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="card-elevated p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              You&apos;re on the list! 🎉
            </h1>

            <p className="text-muted-foreground mb-8">
              Thank you for your interest in FRESHR! We&apos;ve received your
              payment details and will verify your transaction.
            </p>

            <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <span>
                    We&apos;ll verify your transaction (usually within 24-48
                    hours)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>
                    You&apos;ll receive an email with your login credentials
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Start crushing your exams with FRESHR!</span>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                In the meantime, join our Discord community for updates and
                support:
              </p>

              <a
                href="https://discord.gg/dtsaf2UQZn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                  Join Discord Community
                </Button>
              </a>

              <Link href="/">
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FRESHR</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Join FRESHR Premium
          </h1>
          <p className="text-muted-foreground">
            Complete your payment and fill out the form below to get started
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="card-elevated p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Payment Instructions
          </h3>

          <div className="space-y-4 text-sm">
            {/* Payment Method Tabs */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setActivePayment("bkash");
                  setCopied(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  activePayment === "bkash"
                    ? "bg-[#E2136E] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>bKash</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePayment("nagad");
                  setCopied(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold transition-all ${
                  activePayment === "nagad"
                    ? "bg-[#F6921E] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>Nagad</span>
              </button>
            </div>

            {/* Price */}
            <div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                backgroundColor: `${currentPayment.color}10`,
                borderColor: `${currentPayment.color}20`,
              }}
            >
              <span className="font-medium">Amount:</span>
              <span
                className="font-bold text-lg"
                style={{ color: currentPayment.color }}
              >
                ৳250
              </span>
            </div>

            {/* Steps */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <ol className="space-y-3 text-muted-foreground">
                {currentPayment.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${currentPayment.color}10`,
                        color: currentPayment.color,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>

              {/* Copyable Number */}
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full flex items-center justify-between p-3 bg-background rounded-lg border transition-colors group cursor-pointer"
                style={{
                  borderColor: `${currentPayment.color}30`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = currentPayment.color)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = `${currentPayment.color}30`)
                }
              >
                <code
                  className="font-mono font-bold text-lg"
                  style={{ color: currentPayment.color }}
                >
                  {currentPayment.number}
                </code>
                <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Click to copy</span>
                    </>
                  )}
                </span>
              </button>

              <ol className="space-y-3 text-muted-foreground">
                {currentPayment.stepsAfterNumber.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${currentPayment.color}10`,
                        color: currentPayment.color,
                      }}
                    >
                      {index + 4}
                    </span>
                    <span>{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card-elevated p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={formState === "submitting"}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={formState === "submitting"}
              />
              <p className="text-xs text-muted-foreground">
                The number you used for payment
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transactionId"
                className="text-sm font-medium flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Transaction ID
              </label>
              <Input
                id="transactionId"
                type="text"
                placeholder="e.g., TXN123456789"
                value={formData.transactionId}
                onChange={(e) =>
                  setFormData({ ...formData, transactionId: e.target.value })
                }
                disabled={formState === "submitting"}
              />
              <p className="text-xs text-muted-foreground">
                You&apos;ll find this in your bKash/Nagad/Rocket confirmation
                SMS
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={formState === "submitting"}
            >
              {formState === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Submit & Join Waitlist
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            By submitting, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
