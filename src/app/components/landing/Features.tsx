"use client";

import { motion } from "framer-motion";
import { Database, FileCheck, BookMarked, GitBranch } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Presentation",
    description:
      "Create & edit aura-farming slides, presentation content, speech notes, and directly export them as PPTX.",
    color: "primary",
  },
  {
    icon: FileCheck,
    title: "Quizzes",
    description:
      "Be your own judge before exams. Quiz yourself using PDFs and lecture notes with different difficulty levels and question types.",
    color: "accent",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-primary font-semibold mb-2">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Our core features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ace your university work.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-elevated p-6 sm:p-8 group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                  feature.color === "primary"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
