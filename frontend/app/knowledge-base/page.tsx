import { Metadata } from 'next';
import KnowledgeBaseClient from './KnowledgeBaseClient';

export const metadata: Metadata = {
  title: 'Legal Library | LawCaseAI Intelligence Layer',
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseClient />;
}
