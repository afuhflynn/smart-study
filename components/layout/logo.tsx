"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export const Logo = () => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="">
      <Link href="/" className="flex items-center space-x-2 w-auto">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">SmartStudy</span>
      </Link>
    </motion.div>
  );
};
