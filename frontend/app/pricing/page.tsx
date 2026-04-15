import { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing - LawCaseAI | Invest in Your Practice",
  description: "Simple, transparent pricing for law firms of all sizes. Choice between Personal and Business plans.",
};

export default function PricingPage() {
  return <PricingClient />;
}
