"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-elevated p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* Decorative quote */}
          <div className="absolute top-4 left-4 text-primary/10">
            <Quote className="w-20 h-20" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-primary-foreground">
              A
            </div>

            <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 text-balance leading-relaxed">
              "I used PrepPrep for my Chemistry midterms at NSU. The AI caught a
              niche topic from{" "}
              <span className="text-primary font-semibold">Slide 42</span> that
              I would have totally skipped.{" "}
              <span className="text-accent font-semibold">Saved my grade.</span>
              "
            </blockquote>

            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">Anika R.</span>
              <span className="mx-2">·</span>
              <span>Biochemistry Major, NSU</span>
            </div>
          </div>

          {/* Background gradient */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonial;
