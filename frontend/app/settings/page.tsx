import { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings - LawCaseAI | System Configuration",
  description: "Configure your profile, security protocols, firm management, and billing units.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
