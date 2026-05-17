"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
            style: {
              background: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              padding: "14px 22px",
              fontSize: "11px",
              fontWeight: "900",
              fontFamily: "'Outfit', system-ui, sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              maxWidth: "450px",
            },
            success: {
              iconTheme: {
                primary: "#00e676",
                secondary: "rgba(10, 10, 15, 0.95)",
              },
              style: {
                border: "1px solid rgba(0, 230, 118, 0.25)",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "rgba(10, 10, 15, 0.95)",
              },
              style: {
                border: "1px solid rgba(244, 63, 94, 0.25)",
              },
            },
          }}
          containerStyle={{
            top: "40px",
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
