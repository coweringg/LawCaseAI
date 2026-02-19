import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import api from '@/utils/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import FileGrid from '@/components/FileGrid';
import FileAISummary from '@/components/FileAISummary';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function CaseDocuments() {
    const router = useRouter();
    const { id } = router.query;
    const { token } = useAuth();
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        if (!id || !token) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/files/case/${id}`);
            if (response.data.success) {
                setFiles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [id, token]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id || !token) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', id as string);

        try {
            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = response.data;
            if (data.success) {
                toast.success('File uploaded successfully');
                fetchFiles();
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('Network error during upload');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleSelect = (docId: string) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(i => i !== docId));
        } else {
            setSelectedDocs([...selectedDocs, docId]);
        }
    };

    const handleFileClick = (file: any) => {
        setSelectedFile(file);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] -m-8">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-between px-6 z-20">
                        <div className="flex items-center gap-4">
                            <Link href={`/cases/${id}`} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                <span className="material-icons-round text-lg">arrow_back</span>
                            </Link>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">Document Manager</span>
                                <h1 className="text-sm font-bold text-primary dark:text-blue-400 truncate max-w-[300px]">Case ID: {id}</h1>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-xl px-8 hidden md:block">
                            <div className="relative group">
                                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">search</span>
                                <input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none dark:text-white" placeholder="Search case documents..." type="text" />
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar: Folder Tree */}
                        <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col hidden md:flex">
                            <div className="p-4 flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">File Directory</h2>
                            </div>
                            <nav className="flex-1 overflow-y-auto px-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary bg-primary/5 rounded-lg">
                                        <span className="material-icons-round text-sm">folder_open</span>
                                        All Documents
                                    </div>
                                </div>
                            </nav>
                        </aside>

                        {/* Main Workspace */}
                        <section className="flex-1 flex flex-col bg-white dark:bg-surface-dark overflow-hidden">
                            <div className="p-6 pb-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h2>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <span>Case Management</span>
                                            <span className="material-icons-round text-[12px]">chevron_right</span>
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">All Files</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
                                            >
                                                <span className="material-icons-round text-sm">grid_view</span>
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
                                            >
                                                <span className="material-icons-round text-sm">list</span>
                                            </button>
                                        </div>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleUpload}
                                            className="hidden"
                                        />

                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="material-icons-round text-lg">upload</span>}
                                            {isUploading ? 'Uploading...' : 'Upload File'}
                                        </button>
                                    </div>
                                </div>

                                {/* Dropzone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-primary">
                                        <span className="material-icons-round">cloud_upload</span>
                                        <span className="text-sm font-medium">Click or drag and drop files here to upload</span>
                                    </div>
                                </div>
                            </div>

                            {/* Document List/Grid */}
                            <div className="flex-1 overflow-auto px-6 mt-4">
                                {isLoading ? (
                                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                                ) : viewMode === 'list' ? (
                                    <table className="w-full text-left border-separate border-spacing-0">
                                        <thead className="sticky top-0 bg-white dark:bg-surface-dark z-10">
                                            <tr>
                                                <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-800 w-10">
                                                    <input className="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox" />
                                                </th>
                                                <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                                                <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                                <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">Size</th>
                                                <th className="py-3 px-4 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Date Uploaded</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {files.map((file) => (
                                                <tr
                                                    key={file._id}
                                                    onClick={() => handleFileClick(file)}
                                                    className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all cursor-pointer ${selectedFile?._id === file._id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                                >
                                                    <td className="py-4 px-4 border-b border-slate-50 dark:border-slate-800/50" onClick={(e) => e.stopPropagation()}>
                                                        <input className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary dark:bg-slate-700" type="checkbox" checked={selectedDocs.includes(file._id)} onChange={() => toggleSelect(file._id)} />
                                                    </td>
                                                    <td className="py-4 px-4 border-b border-slate-50 dark:border-slate-800/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${file.type.includes('pdf') ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' :
                                                                file.type.includes('word') ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' :
                                                                    'bg-amber-50 text-amber-500 dark:bg-amber-900/20'
                                                                }`}>
                                                                <span className="material-icons-round text-lg">
                                                                    {file.type.includes('pdf') ? 'picture_as_pdf' : file.type.includes('word') ? 'description' : 'image'}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{file.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 border-b border-slate-50 dark:border-slate-800/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{file.type.split('/').pop()}</td>
                                                    <td className="py-4 px-4 border-b border-slate-50 dark:border-slate-800/50 text-[10px] font-bold text-slate-500">{formatSize(file.size)}</td>
                                                    <td className="py-4 px-4 border-b border-slate-50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">{new Date(file.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {files.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center text-slate-400 text-sm italic">No documents found for this case.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                ) : (
                                    <FileGrid
                                        files={files}
                                        onFileSelect={handleFileClick}
                                        selectedFileId={selectedFile?._id}
                                    />
                                )}
                            </div>
                        </section>

                        {/* Right Panel: Context Details or AI Summary */}
                        {selectedFile ? (
                            <FileAISummary file={selectedFile} onClose={() => setSelectedFile(null)} />
                        ) : (
                            <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hidden lg:flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                <span className="material-icons-round text-4xl mb-2 opacity-50">description</span>
                                <p className="text-sm">Select a file to view AI insights and details.</p>
                            </aside>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
