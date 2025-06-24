"use client";

import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const socialLinks = [
    {
      name: "Twitter",
      href: "https://x.com/afuhflynn",
      icon: Twitter,
      color: "hover:text-blue-400",
    },
    {
      name: "GitHub",
      href: "https://github.com/afuhflynn/smart-study.git",
      icon: Github,
      color: "hover:text-gray-600 dark:hover:text-gray-300",
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/afuflynn",
      icon: Linkedin,
      color: "hover:text-blue-600",
    },
    {
      name: "Email",
      href: "mailto:flyinnsafuh@gmail.com",
      icon: Mail,
      color: "hover:text-purple-600",
    },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-slate-900"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 border-t border-white/20 w-full">
        <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
          <div className="flex gap-8 items-start w-full content-between">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="col-span-2 lg:col-span-2"
            >
              <Link href="/" className="flex items-center space-x-2 group mb-4">
                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-2 shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300">
                  SmartStudy
                </span>
              </Link>

              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-md mb-6">
                Transform your reading experience with AI-powered summaries,
                interactive quizzes, and natural voice narration. Learn faster,
                retain more.
              </p>

              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <div key={social.name}>
                    <Link
                      href={social.href}
                      className={`text-gray-400 ${social.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/10`}
                    >
                      <social.icon className="h-5 w-5" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 border-t border-white/20 pt-8"
          >
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                © 2024 SmartStudy. Made with{" "}
                <span className="mx-1">
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </span>{" "}
                for readers everywhere.
              </p>

              {/* Required "Built on Bolt" Badge */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Powered by
                </span>
                <Link
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover-glow"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    ⚡
                  </motion.span>
                  <span>Built on Bolt</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
