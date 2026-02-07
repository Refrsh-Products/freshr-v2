"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Vote } from "lucide-react";
import Link from "next/link";

const FeatureVote = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Want a new feature?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Help us build what you need. Your voice matters in shaping FRESHR.
          </p>
          <Link href="/vote" target="_blank">
            <Button variant="outline" size="lg">
              <Vote className="w-5 h-5" />
              Vote now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureVote;
