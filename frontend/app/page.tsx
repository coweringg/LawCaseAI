import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "LawCaseAI - Enterprise AI Legal Case Management",
  description: "Professional AI-driven legal case management for US lawyers. Secure, subscription-based platform for modern law firm infrastructure.",
  openGraph: {
    title: "LawCaseAI - Enterprise AI Legal Case Management",
    description: "Professional AI-driven legal case management for US lawyers.",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
