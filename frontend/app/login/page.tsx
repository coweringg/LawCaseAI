import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login - LawCaseAI | Secure Workspace",
  description: "Access your professional intelligence workspace securely.",
};

export default function LoginPage() {
  return <LoginClient />;
}
