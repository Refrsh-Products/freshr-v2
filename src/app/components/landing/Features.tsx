"use client";

import { motion } from "framer-motion";
import { Database, FileCheck, BookMarked, GitBranch } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Persistent Vault",
    description:
      "Upload your lecture PDFs once. No more re-uploading every time you want to ask a question.",
    color: "primary",
  },
  {
    icon: FileCheck,
    title: "Exam-Style Quizzes",
    description:
      "AI generates MCQs and Short Questions that mimic the difficulty of BD University exams.",
    color: "accent",
  },
  {
    icon: BookMarked,
    title: "Traceable Answers",
    description:
      'Every explanation cites the exact page and slide it came from. No "AI Hallucinations."',
    color: "primary",
  },
  {
    icon: GitBranch,
    title: "Prerequisite Mapping",
    description:
      "Struggling with Cell Division? We'll show you if it's because you missed a concept in Chromosomes.",
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
            Study Smarter, Not Longer.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to ace your exams, built specifically for
            Bangladeshi students.
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
