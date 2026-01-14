import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export default function RequestAccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FRESHR
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Request Access
          </h1>
          <p className="mt-3 text-muted-foreground">
            FRESHR is currently in private beta. We&apos;re carefully onboarding
            users to ensure the best experience.
          </p>
        </div>

        {/* Contact Options */}
        <div className="space-y-4">
          {/* Email Option */}
          <a
            href="mailto:heyrefresh@gmail.com?subject=FRESHR Access Request&body=Hi, I would like to request access to FRESHR. %0D%0A%0D%0AMy name: %0D%0AHow I plan to use FRESHR: "
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Email Us</h3>
              <p className="text-sm text-muted-foreground">
                heyrefresh@gmail.com
              </p>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Recommended
            </span>
          </a>

          {/* Discord Option */}
          <a
            href="https://discord.gg/dtsaf2UQZn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-[#5865F2]/10 flex items-center justify-center group-hover:bg-[#5865F2]/20 transition-colors">
              <MessageCircle className="h-6 w-6 text-[#5865F2]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Join our Discord
              </h3>
              <p className="text-sm text-muted-foreground">
                Chat with us and the community
              </p>
            </div>
          </a>
        </div>

        {/* Info Box */}
        <div className="bg-muted/50 rounded-xl p-6 border border-border">
          <h4 className="font-semibold text-foreground mb-2">
            What to include in your request:
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Your name and email address
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              How you plan to use FRESHR (student, teacher, professional, etc.)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Any specific features you&apos;re interested in
            </li>
          </ul>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
