import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout | LawCaseAI',
  description: 'Complete your subscription to LawCaseAI and unlock professional legal intelligence.',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
