"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({ children, content, position = "right", delay = 0.3 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  let timeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsVisible(true), delay * 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const variants = {
    top: { y: 5, x: "-50%", opacity: 0 },
    bottom: { y: -5, x: "-50%", opacity: 0 },
    left: { x: 5, y: "-50%", opacity: 0 },
    right: { x: -5, y: "-50%", opacity: 0 },
  };

  const animatedVariants = {
    top: { y: 0, x: "-50%", opacity: 1 },
    bottom: { y: 0, x: "-50%", opacity: 1 },
    left: { x: 0, y: "-50%", opacity: 1 },
    right: { x: 0, y: "-50%", opacity: 1 },
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={variants[position]}
            animate={animatedVariants[position]}
            exit={variants[position]}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 px-2 py-1 text-xs font-semibold text-background bg-foreground rounded-md shadow-lg whitespace-nowrap pointer-events-none ${positions[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
