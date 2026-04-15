import { Metadata } from 'next';
import AISetupClient from './AISetupClient';

export const metadata: Metadata = {
  title: 'Step 3: AI Initialization - LawCaseAI',
  description: 'Initializing secure environment and indexing legal intelligence.',
};

export default function AISetupPage() {
  return <AISetupClient />;
}
