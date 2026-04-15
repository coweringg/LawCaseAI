import { Metadata } from 'next';
import NewCaseClient from './NewCaseClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - Initialize Intelligence Unit',
};

export default function NewCasePage() {
  return <NewCaseClient />;
}
