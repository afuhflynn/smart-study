"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { socialLinks } from "@/constants/constants";

export function Footer() {
  return (
    <footer className="bg-card border-t py-6 paddingX">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="w-auto">
            <div className="mb-4 w-auto">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              AI-powered study assistant helping students learn more efficiently
              and effectively.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <div>
                  <Link
                    href={social.href}
                    className={`text-gray-400 ${social.color} transition-all duration-300 p-2 rounded-lg`}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-primary"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex items-center w-full justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SmartStudy. All rights reserved.
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
              className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-medium text-white duration-300 transform hover:scale-105 shadow-lg hover-glow"
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
      </div>
    </footer>
  );
}
