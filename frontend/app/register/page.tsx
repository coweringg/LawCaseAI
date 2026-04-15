import { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Join LawCaseAI | Secure Legal Intelligence",
  description: "Deploy your professional AI infrastructure today. Secure and compliant legal workspace.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
