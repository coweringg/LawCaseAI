import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lawcaseai-gamma.vercel.app'),
  title: "LawCaseAI | Legal Core Intelligence",
  description: "Advanced legal document analysis and protection powered by next-generation AI. The operational command for modern law firms.",
  keywords: ["law", "legal ai", "case management", "document analysis", "legal intelligence"],
  authors: [{ name: "LawCaseAI Team" }],
  openGraph: {
    title: "LawCaseAI | Legal Core Intelligence",
    description: "Advanced legal document analysis and protection powered by next-generation AI.",
    url: "https://lawcaseai-gamma.vercel.app",
    siteName: "LawCaseAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LawCaseAI Dashboard Preview",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LawCaseAI | Legal Core Intelligence",
    description: "Advanced legal document analysis and protection powered by next-generation AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <Script 
          src="https://cdn.paddle.com/paddle/v2/paddle.js" 
          strategy="lazyOnload" 
        />
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
