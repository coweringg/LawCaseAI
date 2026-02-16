import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import FileGrid from '@/components/FileGrid';

export default function DocumentVault() {
    // Mock Data for demonstration
    const recentFiles = [
        { id: '1', name: 'Admission_Request_Final.pdf', type: 'pdf', size: '2.4 MB', date: 'Oct 24, 2023' },
        { id: '2', name: 'Case_Summary_Draft_v2.docx', type: 'docx', size: '842 KB', date: 'Oct 22, 2023' },
        { id: '3', name: 'Evidence_Photo_01.jpg', type: 'image', size: '8.2 MB', date: 'Oct 09, 2023' },
        { id: '4', name: 'Asset_Discovery_Log.xlsx', type: 'xlsx', size: '1.8 MB', date: 'Oct 10, 2023' },
        { id: '5', name: 'Witness_Statement_Smith.pdf', type: 'pdf', size: '1.2 MB', date: 'Oct 08, 2023' },
        { id: '6', name: 'Court_Order_10-05.pdf', type: 'pdf', size: '3.1 MB', date: 'Oct 05, 2023' },
    ];

    const [selectedFile, setSelectedFile] = React.useState<any>(null);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document Vault</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Centralized repository for all case files.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">filter_list</span>
                                <select className="pl-10 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-primary/20">
                                    <option>All Files</option>
                                    <option>PDFs</option>
                                    <option>Images</option>
                                    <option>Key Evidence</option>
                                </select>
                            </div>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                                <span className="material-icons-round text-lg">upload</span>
                                Upload
                            </button>
                        </div>
                    </div>

                    {/* Quick Access / Recent */}
                    <div>
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Recent Uploads</h2>
                        <FileGrid
                            files={recentFiles}
                            onFileSelect={(f) => setSelectedFile(f)}
                            selectedFileId={selectedFile?.id}
                        />
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
