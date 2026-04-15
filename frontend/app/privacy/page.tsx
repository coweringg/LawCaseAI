import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy | LawCaseAI",
  description: "LawCaseAI Privacy Policy - How we protect your legal data and intellectual property.",
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
