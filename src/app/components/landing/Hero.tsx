"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 max-w-5xl mx-auto text-center">
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground/80">
            No more copy-pasting into ChatGPT. 100% based on your syllabus.
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
        >
          Crush Your Finals,{" "}
          <span className="gradient-text">Not Your Spirit.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance"
        >
          The first AI study partner built specifically for{" "}
          <span className="font-semibold text-foreground">
            DU, BUET, and NSU Science students.
          </span>{" "}
          Turn your lecture PDFs into custom practice exams in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="hero"
            size="xl"
            className="w-full sm:w-auto glow-primary"
          >
            <Zap className="w-5 h-5" />
            Start Practicing for Free
          </Button>
          <Button variant="outline" size="xl" className="w-full sm:w-auto">
            <BookOpen className="w-5 h-5" />
            See How It Works
          </Button>
        </motion.div>

        {/* Floating illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative"
        >
          <div className="card-elevated p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-primary/20 rounded w-5/6" />
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Generating practice questions from Slide 42...
                </div>
              </div>
            </div>
          </div>
          {/* Floating elements */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 sm:right-8 card-elevated p-3 shadow-lg"
          >
            <span className="text-2xl">📚</span>
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -left-4 sm:left-8 card-elevated p-3 shadow-lg"
          >
            <span className="text-2xl">🎯</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
