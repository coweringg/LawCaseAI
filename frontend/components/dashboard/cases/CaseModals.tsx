"use client";

import ConfirmModal from '@/components/modals/ConfirmModal';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Folder, Loader2, X, Zap } from 'lucide-react';

interface CaseModalsProps {
    isConfirmModalOpen: boolean;
    setIsConfirmModalOpen: (val: boolean) => void;
    onConfirmCloseCase: () => void;
    caseData: any;

    deleteModalOpen: boolean;
    setDeleteModalOpen: (val: boolean) => void;
    onDeleteFile: () => void;
    fileToDelete: any;

    renameModalOpen: boolean;
    setRenameModalOpen: (val: boolean) => void;
    onRenameFile: () => void;
    newFileName: string;
    setNewFileName: (val: string) => void;

    commitModalOpen: boolean;
    setCommitModalOpen: (val: boolean) => void;
    onCommitFile: () => void;
    commitFileName: string;
    setCommitFileName: (val: string) => void;
    isSavingSummary: boolean;
    summaryToSave: any;

    isSummaryModalOpen: boolean;
    setIsSummaryModalOpen: (val: boolean) => void;
    caseSummary: string | null;
    onArchiveAsPdf: () => void;
}

export function CaseModals({
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    onConfirmCloseCase,
    caseData,
    deleteModalOpen,
    setDeleteModalOpen,
    onDeleteFile,
    fileToDelete,
    renameModalOpen,
    setRenameModalOpen,
    onRenameFile,
    newFileName,
    setNewFileName,
    commitModalOpen,
    setCommitModalOpen,
    onCommitFile,
    commitFileName,
    setCommitFileName,
    isSavingSummary,
    summaryToSave,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    caseSummary,
    onArchiveAsPdf
}: CaseModalsProps) {
    return (
        <>
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={onConfirmCloseCase}
                title="Seal Case Intelligence"
                message={`This action will deactivate the workspace for "${caseData?.name}". Authorized access will be restricted until reactivation.`}
                confirmLabel="Confirm Deactivation"
                cancelLabel="Maintain Active"
                isDestructive={true}
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); }}
                onConfirm={onDeleteFile}
                title="Purge Analysis Unit"
                message={`Confirm permanent destruction of "${fileToDelete?.name}". This signal will be erased from the collective intelligence repository.`}
                confirmLabel="Purge Data"
                cancelLabel="Cancel"
                isDestructive={true}
            />

            <AnimatePresence>
                {renameModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRenameModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0c0c12] border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative z-10 w-full max-w-md overflow-hidden"
                        >
                            <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className="w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center shadow-2xl">
                                    <Edit2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tightest leading-none mb-1.5">Update Identity</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Change Database Alias</p>
                                </div>
                            </div>

                            <div className="relative z-10 mb-8">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">New Unit Name</label>
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onRenameFile() }}                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[12px] font-bold uppercase tracking-wider text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700"
                                    placeholder="Enter new alias..."
                                />
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                                <button
                                    onClick={onRenameFile}
                                    disabled={!newFileName.trim()}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-background-dark rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_25px_rgba(0,230,118,0.4)] disabled:opacity-50"
                                >
                                    Update Protocol
                                </button>
                                <button
                                    onClick={() => setRenameModalOpen(false)}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {commitModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setCommitModalOpen(false); }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0c0c12] border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative z-10 w-full max-w-md overflow-hidden"
                        >
                            <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-5 mb-8 relative z-10">
                                <div className="w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center shadow-2xl">
                                    {summaryToSave ? <Zap size={24} /> : <Folder size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tightest leading-none mb-1.5">
                                        {summaryToSave ? 'Permit Intelligence Unit' : 'Authorized Commitment'}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                        {summaryToSave ? 'Create Permanent Signal' : 'Stage in Core Repository'}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 mb-8">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Assign Custom Alias (Optional)</label>
                                <input
                                    type="text"
                                    value={commitFileName}
                                    onChange={(e) => setCommitFileName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onCommitFile() }}
                                    placeholder="Use default identifier..."                                    disabled={isSavingSummary}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-[12px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                                />
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                                <button
                                    onClick={onCommitFile}
                                    disabled={isSavingSummary}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 text-background-dark rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_25px_rgba(0,230,118,0.4)] disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSavingSummary ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        'Execute Commitment'
                                    )}
                                </button>
                                <button
                                    onClick={() => { setCommitModalOpen(false); }}
                                    disabled={isSavingSummary}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/5"
                                >
                                    Abort Sequence
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSummaryModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSummaryModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-[#0c0c12] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="absolute inset-0 micro-grid opacity-[0.1] pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                            
                            <div className="p-8 lg:p-10 border-b border-white/5 flex items-center justify-between relative z-10 flex-none bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Zap size={28} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tightest leading-none mb-2">Neural Synopsis</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Comprehensive Intelligence Synthesis</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-hide">
                                <div className="whitespace-pre-wrap text-[14px] text-slate-300 leading-relaxed font-bold space-y-4">
                                    {caseSummary}
                                </div>
                            </div>

                            <div className="p-8 lg:p-10 border-t border-white/5 flex flex-col sm:flex-row gap-4 relative z-10 bg-white/[0.01] flex-none">
                                <button
                                    onClick={onArchiveAsPdf}
                                    className="flex-1 px-8 py-4 bg-primary hover:bg-primary/90 text-background-dark rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(0,230,118,0.4)] flex items-center justify-center gap-3"
                                >
                                    <Zap size={14} fill="currentColor" />
                                    Archive Signal as PDF
                                </button>
                                <button
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all border border-white/5"
                                >
                                    Close Feed
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
