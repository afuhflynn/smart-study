"use client";

import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react";
import { testimonials } from "@/constants/constants";

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="paddingX"
    >
      <Card className="h-full card-hover">
        <CardContent className="p-6">
          <div className="flex mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <blockquote className="text-muted-foreground mb-4">
            "{quote}"
          </blockquote>
          <div>
            <div className="font-semibold">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by students worldwide
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <TestimonialCard
              quote={item.quote}
              author={item.author}
              role={item.role}
              rating={item.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
