import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - Dashboard',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
