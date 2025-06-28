import {
  Brain,
  Clock,
  FileQuestion,
  FileText,
  Github,
  Home,
  Linkedin,
  Mail,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Twitter,
  Upload,
} from "lucide-react";

export const MAX_CHARACTER_INPUT_LENGTH = 10000;
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const steps = [
  {
    number: "1",
    title: "Upload",
    description: "Drag and drop your textbook pages or PDFs",
    icon: Upload,
  },
  {
    number: "2",
    title: "Extract",
    description: "AI reads and extracts text with high accuracy",
    icon: Brain,
  },
  {
    number: "3",
    title: "Generate",
    description: "Create summaries and quizzes instantly",
    icon: Sparkles,
  },
  {
    number: "4",
    title: "Learn",
    description: "Study smarter and track your progress",
    icon: TrendingUp,
  },
];

export const features = [
  {
    icon: Upload,
    title: "Smart OCR Technology",
    description:
      "Advanced optical character recognition that accurately extracts text from any image or PDF with 95%+ accuracy.",
    features: ["Multi-format support", "Batch processing", "Real-time preview"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Summaries",
    description:
      "GPT-4 generates concise, structured summaries that capture key concepts and important details.",
    features: [
      "Bullet-point format",
      "Key concept extraction",
      "Customizable length",
    ],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: FileQuestion,
    title: "Interactive Quizzes",
    description:
      "Automatically generated multiple-choice questions to test comprehension and reinforce learning.",
    features: ["Adaptive difficulty", "Instant feedback", "Progress tracking"],
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "Smart Analytics",
    description:
      "Track your learning progress with detailed insights and personalized recommendations.",
    features: ["Performance metrics", "Study streaks", "Goal setting"],
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Adaptive content that adjusts to your learning style and pace for optimal retention.",
    features: ["Learning paths", "Difficulty adjustment", "Spaced repetition"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is encrypted and secure. We never share your content with third parties.",
    features: ["End-to-end encryption", "GDPR compliant", "Data ownership"],
    gradient: "from-gray-500 to-slate-500",
  },
];

export const testimonials = [
  {
    quote:
      "SmartStudy helped me improve my grades by 30%. The AI summaries are incredibly accurate and save me hours of reading.",
    author: "Afuh Flynn",
    role: "Engineering Student",
    rating: 5,
  },
  {
    quote:
      "The quiz feature is amazing for exam prep. It's like having a personal tutor that knows exactly what to test me on.",
    author: "Faith Francis",
    role: "Engineering Student",
    rating: 5,
  },
  {
    quote:
      "I can process entire chapters in minutes instead of hours. This app is a game-changer for busy students.",
    author: "Precious Tenye",
    role: "Engineering Student",
    rating: 5,
  },
];

export const socialLinks = [
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

export const dashboardNavigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and quick actions",
    badge: null,
  },
  {
    title: "Summaries",
    href: "/dashboard/summaries",
    icon: FileText,
    description: "View AI-generated summaries",
    badge: null,
  },
  {
    title: "Quizzes",
    href: "/dashboard/quizzes",
    icon: FileQuestion,
    description: "Practice with generated quizzes",
    badge: null,
  },
];

export const defaultVoices = [
  {
    id: "rachel",
    name: "Rachel",
    category: "premade",
    description: "Calm American female",
  },
  {
    id: "adam",
    name: "Adam",
    category: "premade",
    description: "Deep American male",
  },
  {
    id: "bella",
    name: "Bella",
    category: "premade",
    description: "Warm British female",
  },
  {
    id: "charlie",
    name: "Charlie",
    category: "premade",
    description: "Professional British male",
  },
];
