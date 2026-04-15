import { Metadata } from "next";
import RefundClient from "./RefundClient";

export const metadata: Metadata = {
  title: "Refund Policy | LawCaseAI",
  description: "LawCaseAI Refund Policy - Professional transparency regarding our billing and neural processing credits.",
};

export default function RefundPage() {
  return <RefundClient />;
}
