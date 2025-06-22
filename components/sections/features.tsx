'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Brain, 
  Headphones, 
  Target, 
  Zap, 
  Shield 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const features = [
  {
    icon: Upload,
    title: 'Smart Document Upload',
    description: 'Upload PDFs, images, or text files. Our AI extracts and processes content with OCR technology.',
    badge: 'OCR Powered',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    title: 'Intelligent Chunking',
    description: 'Content is automatically organized into logical sections for better comprehension.',
    badge: 'AI Organized',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Sparkles,
    title: 'AI Summaries',
    description: 'Get comprehensive summaries with key points, insights, and takeaways.',
    badge: 'Gemini AI',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    icon: Brain,
    title: 'Quiz Generation',
    description: 'Automatically generate MCQs and fill-in-the-blank questions to test understanding.',
    badge: 'Adaptive',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Headphones,
    title: 'Premium Audio',
    description: 'Natural text-to-speech with real-time highlighting and playback controls.',
    badge: 'ElevenLabs',
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    icon: Target,
    title: 'Smart Recommendations',
    description: 'Personalized reading suggestions based on your interests and reading history.',
    badge: 'ML Powered',
    gradient: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized processing pipeline delivers results in seconds, not minutes.',
    badge: 'Optimized',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your documents are processed securely with enterprise-grade encryption.',
    badge: 'Secure',
    gradient: 'from-teal-500 to-green-500'
  }
];

export function Features() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">for Modern Readers</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of reading with our comprehensive suite of AI-powered tools 
            designed to enhance learning and comprehension.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full glass border-white/20 hover-glow transition-all duration-300 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/10 backdrop-blur-sm border-white/20 animate-shimmer"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-gradient transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-sm leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <div className="glass rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-gradient">
                Ready to Transform Your Reading?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of readers who have already enhanced their learning experience with ChapterFlux.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover-glow transition-all duration-300"
                >
                  <Link href="/auth/signin">Get Started Free</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}