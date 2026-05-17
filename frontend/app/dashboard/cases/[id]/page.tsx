import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import CaseClient from './CaseClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - Case Workspace',
};

export default function CasePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-background-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <CaseClient />
    </Suspense>
  );
}
