"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  FileQuestion,
  Presentation,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signout } from "./actions";

interface HomeContentProps {
  user: User;
}

export default function HomeContent({ user }: HomeContentProps) {
  const userInitials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FRESHR
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.email ?? "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex items-center cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => signout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome back
              {user.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name}`
                : ""}
              !
            </h1>
            <p className="text-xl text-muted-foreground">
              What would you like to create today?
            </p>
          </div>

          {/* Options Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Generate Quiz Card */}
            <Link href="/dashboard/quiz" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileQuestion className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Generate Quiz</CardTitle>
                  <CardDescription className="text-base">
                    Create interactive quizzes from your documents, notes, or
                    any topic
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li>✓ Upload PDFs or paste text</li>
                    <li>✓ AI-powered question generation</li>
                    <li>✓ Multiple choice</li>
                    <li>✓ Track your progress</li>
                  </ul>
                  <Button className="w-full cursor-pointer" variant="hero">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Generate Presentation Card */}
            <Link href="/dashboard/presentation" className="group">
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/50 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <Presentation className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">
                    Generate Presentation
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create stunning slide decks from your content in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                    <li>✓ Transform notes into slides</li>
                    <li>✓ Professional templates</li>
                    <li>✓ Auto-generated layouts</li>
                    <li>✓ Speaker Notes</li>
                  </ul>
                  <Button className="w-full cursor-pointer" variant="accent">
                    Start Presentation
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Or continue with your existing work
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/files">My Files</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/analytics">Analytics</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
