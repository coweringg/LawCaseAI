"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
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
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1.25rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
              padding: "16px 24px",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.01em",
              maxWidth: "450px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "rgba(15, 23, 42, 0.8)",
              },
              style: {
                border: "1px solid rgba(16, 185, 129, 0.2)",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "rgba(15, 23, 42, 0.8)",
              },
              style: {
                border: "1px solid rgba(244, 63, 94, 0.2)",
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
