"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, ShieldCheck } from "lucide-react";
import Link from "next/link";

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            <span className="gradient-text">Join the Waitlist Now</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be among the first to experience the future of university learning.
            Save your semester with FRESHR.
          </p>

          <Link href="/join">
            <Button
              variant="hero"
              size="xl"
              className="glow-primary cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Join the Waitlist
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
