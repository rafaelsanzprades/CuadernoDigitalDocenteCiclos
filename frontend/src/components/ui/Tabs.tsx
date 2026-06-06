"use client";
import React, { createContext, useContext, useState } from "react";
import { motion } from "framer-motion";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 p-1.5 rounded-xl bg-background/40 backdrop-blur-md border border-[var(--glass-border)] shadow-sm overflow-x-auto scrollbar-hide ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
  onClick,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => {
        context.setActiveTab(value);
        if (onClick) onClick();
      }}
      className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 whitespace-nowrap outline-none
        ${isActive ? "text-white" : "text-muted hover:text-foreground hover:bg-foreground/5"}
        ${className}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-accent rounded-lg shadow-md -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
