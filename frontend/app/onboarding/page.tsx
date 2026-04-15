import { Metadata } from "next";
import OnboardingClient from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Onboarding - LawCaseAI | Deploy Your Workspace",
  description: "Initialize your professional AI legal workspace and set up your first case matter.",
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
