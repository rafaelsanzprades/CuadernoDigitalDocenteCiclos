"use client";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  action?: ReactNode;
  iconColor?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  iconColor = "text-accent" 
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-card p-10 border-l-4 border-l-accent flex flex-col items-center justify-center text-center space-y-6 w-full max-w-3xl mx-auto my-8 relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="p-5 bg-background/50 rounded-full border border-[var(--glass-border)] shadow-xl relative z-10"
      >
        <Icon className={`w-16 h-16 ${iconColor}`} strokeWidth={1.5} />
      </motion.div>

      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3 relative z-10"
      >
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{title}</h2>
        <div className="text-muted max-w-lg mx-auto text-lg leading-relaxed">
          {description}
        </div>
      </motion.div>

      {action && (
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="pt-4 relative z-10"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
