import { Metadata } from 'next';
import CasesClient from './CasesClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - My Cases',
};

export default function CasesPage() {
  return <CasesClient />;
}
