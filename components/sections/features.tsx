"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { features } from "@/constants/constants";

function FeatureCard({
  icon,
  title,
  description,
  features,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="paddingX"
    >
      <Card className="h-full card-hover card-glow">
        <CardContent className="p-6">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${gradient} rounded-lg mb-4 text-white`}
          >
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to excel
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed to transform how you study and learn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard
              icon={
                <feature.icon className="h-8 w-8 text-black dark:text-white" />
              }
              title={feature.title}
              description={feature.description}
              features={feature.features}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
