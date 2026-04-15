import { Metadata } from 'next';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = {
  title: 'Payment Successful | LawCaseAI',
  description: 'Welcome to the future of legal intelligence. Your subscription is now active.',
};

export default function SuccessPage() {
  return <SuccessClient />;
}
