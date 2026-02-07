"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-32 pb-20 concrete-texture">
      {/* Zen-inspired minimalist background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizontal lines - architectural */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zen-line to-transparent opacity-30" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zen-line to-transparent opacity-30" />

        {/* Subtle sage accent */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-left space-y-8">
            {/* Small accent line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-0.5 bg-accent"
            />

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
            >
              Save your
              <br />
              <span className="text-accent">semester</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed"
            >
              The personal operating system for university{" "}
              <span className="text-foreground font-medium">
                quizzes, presentations, research & more.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link href="/join" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground group"
                >
                  Get Early Access
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-primary/20 hover:border-accent/40"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                See How It Works
              </Button>
            </motion.div>

            {/* Social proof - community */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex items-center gap-2 pt-6"
            >
              <div className="text-sm font-medium text-foreground">
                Join the community
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-accent fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Visual Element - Clean card layout */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            {/* Main card - zen-inspired */}
            <div className="card-elevated p-8 space-y-6 bg-card/80 backdrop-blur-sm">
              {/* Minimalist header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/20" />
                </div>
                <div className="text-xs text-muted-foreground font-mono">FRESHR</div>
              </div>

              {/* Content placeholder - architectural */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-accent/10 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-sm bg-accent/30" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted/50 rounded w-3/4" />
                    <div className="h-2 bg-muted/30 rounded w-1/2" />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="space-y-3">
                  <div className="h-3 bg-muted/40 rounded w-full" />
                  <div className="h-3 bg-muted/40 rounded w-5/6" />
                  <div className="h-3 bg-accent/20 rounded w-4/5" />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <div className="flex-1 h-2 bg-gradient-to-r from-accent/40 to-accent/10 rounded-full" />
                  <span className="text-xs text-accent font-medium">98%</span>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="pt-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  Generating quiz from lecture notes...
                </div>
              </div>
            </div>

            {/* Floating number - architectural accent */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 w-16 h-16 bg-accent/10 backdrop-blur-sm rounded flex items-center justify-center border border-accent/20"
            >
              <span className="text-2xl font-bold text-accent">01</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
