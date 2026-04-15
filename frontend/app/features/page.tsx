import { Metadata } from "next";
import FeaturesClient from "./FeaturesClient";

export const metadata: Metadata = {
    title: "Features - LawCaseAI | Professional AI Legal Intelligence",
    description: "Explore the elite AI capabilities of LawCaseAI, from document insights to automated chronology and jurisprudence research.",
};

export default function FeaturesPage() {
    return <FeaturesClient />;
}
