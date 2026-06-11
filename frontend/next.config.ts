import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    // URL de la API según el entorno.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default withPWA(nextConfig);
