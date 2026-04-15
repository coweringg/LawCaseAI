import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us - LawCaseAI | The Standard in Legal AI",
  description: "Learn about LawCaseAI's mission to revolutionize legal practice management through elite artificial intelligence.",
};

export default function AboutPage() {
  return <AboutClient />;
}
