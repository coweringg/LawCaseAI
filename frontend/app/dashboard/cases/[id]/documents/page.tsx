import { Metadata } from 'next';
import DocumentsClient from './DocumentsClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LawCaseAI - Document Repository',
};

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-[#05060a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <DocumentsClient />
    </Suspense>
  );
}
