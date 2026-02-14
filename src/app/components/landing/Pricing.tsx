"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, LucideProps } from "lucide-react";
import Link from "next/link";

type Plan = {
  name: string;
  subtitle: string;
  price: string;
  period: string;
  altPrice?: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

const plans: Plan[] = [
  {
    name: "Early Access",
    subtitle: "Get started now",
    price: "৳250",
    period: "/month",
    features: [
      "Generate unlimited quizzes",
      "Create unlimited presentations",
      "Export as PPTX",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Join the Waitlist",
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
            Flexible, affordable prices for
            <br />
            most students
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Costs 98% LESS than your course fees.
          </p>

          {/* Payment logos */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-payment-bkash text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
              bKash
            </div>
            <div className="bg-payment-nagad text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
              Nagad
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center max-w-md mx-auto">
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

              <Link href="/join" className="w-full">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full cursor-pointer"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
