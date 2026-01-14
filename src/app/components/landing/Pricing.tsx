"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    subtitle: "The Starter",
    price: "৳0",
    period: "",
    features: ["1 PDF Upload", "10 Quizzes per month", "Basic Topic Tracking"],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  {
    name: "Premium",
    subtitle: "The Pro",
    price: "৳349",
    period: "/month",
    altPrice: "৳999 per Semester",
    features: [
      "Unlimited PDF Uploads",
      "Unlimited Practice Sets",
      "Full Concept Mastery Map",
      "Priority AI Support",
    ],
    cta: "Go Premium",
    popular: true,
    icon: Crown,
  },
];

const Pricing = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-primary font-semibold mb-2">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Simple, Student-Friendly Pricing.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Accepting bKash, Nagad, and Rocket.
          </p>

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-[#E2136E] text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
              bKash
            </div>
            <div className="bg-[#F6921E] text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
              Nagad
            </div>
            <div className="bg-[#8B2C8F] text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
              Rocket
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card-elevated p-6 sm:p-8 relative ${
                plan.popular ? "border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.popular
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <plan.icon className="w-6 h-6" />
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.subtitle}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
                {plan.altPrice && (
                  <p className="text-sm text-muted-foreground mt-1">
                    or {plan.altPrice}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
