import { Metadata } from 'next';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - Calendar',
};

export default function CalendarPage() {
  return <CalendarClient />;
}
