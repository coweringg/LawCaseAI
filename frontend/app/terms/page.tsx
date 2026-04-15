import { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service | LawCaseAI",
  description: "LawCaseAI Terms of Service - The professional agreement for legal infrastructure usage.",
};

export default function TermsPage() {
  return <TermsClient />;
}
