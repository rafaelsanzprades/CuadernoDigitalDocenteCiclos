"use client";
import { SessionProvider } from "next-auth/react";
import { apiInterceptor } from "@/services/apiInterceptor";

if (typeof window !== "undefined") {
  apiInterceptor.init();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
