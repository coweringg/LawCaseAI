import { Metadata } from 'next';
import CaseClient from './CaseClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LawCaseAI - Case Workspace',
};

export default function CasePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-[#05060a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <CaseClient />
    </Suspense>
  );
}
