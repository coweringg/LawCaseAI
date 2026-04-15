import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'LawCaseAI - Smart Search',
};

import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05060a]" />}>
      <SearchClient />
    </Suspense>
  );
}
