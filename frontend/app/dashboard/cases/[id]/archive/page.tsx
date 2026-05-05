import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LawCaseAI - Archived Case Intelligence',
};

export default function ArchivePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-background-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <ArchiveClient />
    </Suspense>
  );
}
