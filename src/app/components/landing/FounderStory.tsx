"use client";

import { motion } from "framer-motion";

const FounderStory = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8">
            We know how you feel
          </h2>

          <div className="card-elevated p-6 sm:p-10 text-left">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our founder has{" "}
              <span className="font-semibold text-foreground">ADHD</span>,
              co-founder has{" "}
              <span className="font-semibold text-foreground">
                trouble reading
              </span>
              , CTO{" "}
              <span className="font-semibold text-foreground">
                failed in maths
              </span>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FounderStory;
