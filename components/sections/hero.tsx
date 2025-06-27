"use client";

import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Brain, Play, CheckCircle, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "../ui/badge";

export function Hero() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  return (
    <section ref={heroRef} className="relative overflow-hidden paddingX">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10"
        style={{ y, opacity }}
      />

      <div className="container mx-auto px-4 py-20 lg:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Sparkles className="h-3 w-3 mr-2" />
              Powered by Advanced AI
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Study Smarter with <span className="gradient-text">AI-Powered</span>{" "}
            Learning
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transform your reading experience with AI-powered summaries,
            interactive quizzes, and natural voice narration. Powered by Google
            Gemini and ElevenLabs.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/70 hover:opacity-90 px-8 py-6 text-lg"
              >
                Upload your first document
                <Upload className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            {/* TODO: Insert link to youtube video */}
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg"
              asChild
            >
              <Link href="https://youtube.com/watch?q=youtube-link">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex items-center justify-center space-x-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Instant results</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Brain className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
      <div className="absolute top-40 right-10 opacity-20">
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap className="h-12 w-12 text-secondary" />
        </motion.div>
      </div>
    </section>
  );
}
