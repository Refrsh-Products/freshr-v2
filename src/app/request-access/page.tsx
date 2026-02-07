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
            users for their best experience.
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

          {/* Whatsapp Option */}
          <a
            href="https://chat.whatsapp.com/KWlmDv1BESp7DwoQ9K7Vyo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-full bg-social-whatsapp/10 flex items-center justify-center group-hover:bg-social-whatsapp/20 transition-colors">
              {/* WhatsApp Logo SVG */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-social-whatsapp"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Join our Whatsapp group
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
