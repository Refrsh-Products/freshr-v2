import { login } from "../actions";
import Link from "next/link";

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FRESHR
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your quizzes and presentations
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-t-md border-0 py-2.5 px-3 text-foreground bg-card ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-2.5 px-3 text-foreground bg-card ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          <div>
            <button
              formAction={login}
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            >
              Sign in
            </button>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <Link
              href="/request-access"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Don&apos;t have access?{" "}
              <span className="font-semibold text-primary">
                Request an invite
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
