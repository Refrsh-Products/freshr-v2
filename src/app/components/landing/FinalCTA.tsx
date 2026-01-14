"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, ShieldCheck } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground/80">
              Study ethically, ace genuinely
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            Stop wasting time on "Assignment Generators" that get you in
            trouble.{" "}
            <span className="gradient-text">
              Start mastering your course material.
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Bangladeshi students who are studying smarter with
            PrepPrep.ai
          </p>

          <Button variant="accent" size="xl" className="glow-accent">
            <Upload className="w-5 h-5" />
            Get Started with 1 Free Upload
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
