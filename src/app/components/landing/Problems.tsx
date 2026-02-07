"use client";

import { motion } from "framer-motion";
import { AlertTriangle, FileQuestion, Link2Off } from "lucide-react";

const problems = [
  {
    icon: FileQuestion,
    title: "The dead PDFS",
    description:
      "PDFs eating dust after it was dumped by your faculty.",
  },
  {
    icon: Link2Off,
    title: "Borrowed GPT",
    description:
      "Shared ChatGPT accounts that got blocked right after the course ended.",
  },
  {
    icon: AlertTriangle,
    title: "The PowerPoint Paralysis",
    description:
      "Hours spent formatting slide titles and bullet points instead of actually rehearsing your presentation.",
  },
];

const Problems = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            You don't have to be Einstein,
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-muted-foreground">
            you just have to be you
          </h3>
          <p className="text-xl font-semibold mb-8">
            Is this you?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-elevated p-6 sm:p-8 group hover:border-destructive/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problems;
