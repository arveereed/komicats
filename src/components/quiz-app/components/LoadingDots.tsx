"use client";

import { motion, type Transition, type Variants } from "framer-motion";

const containerVariants: Variants = {
  initial: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const dotVariants: Variants = {
  initial: {
    y: 0,
    opacity: 0.5,
    scale: 0.9,
  },
  animate: {
    y: -18,
    opacity: 1,
    scale: 1,
  },
};

const dotTransition: Transition = {
  duration: 0.6,
  repeat: Infinity,
  repeatType: "loop",
  ease: "easeInOut",
};

export default function LoadingDots() {
  return (
    <div className="flex w-full items-center justify-center pt-8">
      <motion.div
        className="flex h-16 w-32 items-center justify-center gap-3"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          className="h-4 w-4 rounded-full bg-orange-500 shadow-lg shadow-orange-400/50 md:h-5 md:w-5"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="h-4 w-4 rounded-full bg-rose-500 shadow-lg shadow-rose-400/50 md:h-5 md:w-5"
          variants={dotVariants}
          transition={dotTransition}
        />
        <motion.span
          className="h-4 w-4 rounded-full bg-pink-500 shadow-lg shadow-pink-400/50 md:h-5 md:w-5"
          variants={dotVariants}
          transition={dotTransition}
        />
      </motion.div>
    </div>
  );
}
