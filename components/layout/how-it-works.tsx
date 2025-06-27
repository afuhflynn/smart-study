"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { steps } from "@/constants/constants";

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      className="text-center paddingX"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
          {number}
        </div>
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  );
}

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, fast, effective
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and see results immediately
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <StepCard
                number={step.number}
                title={step.title}
                description={step.description}
                icon={<step.icon className="h-6 w-6" />}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
