"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Folder, Zap, X, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/modals/ConfirmModal';

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
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[#0B1121] border border-white/10 p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center">
                                    <Edit2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Update Identity</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Change Database Alias</p>
                                </div>
                            </div>

                            <div className="relative z-10 mb-6">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">New Unit Name</label>
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onRenameFile() }}
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="flex gap-3 relative z-10">
                                <button
                                    onClick={() => setRenameModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onRenameFile}
                                    disabled={!newFileName.trim()}
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
                                >
                                    Update
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
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-[#0B1121] border border-white/10 p-6 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-sm overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                                    {summaryToSave ? <Zap size={20} /> : <Folder size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">
                                        {summaryToSave ? 'Permit Intelligence Unit' : 'Authorized Commitment'}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                        {summaryToSave ? 'Create Permanent Signal' : 'Stage in Core Repository'}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 mb-6">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign Custom Alias (Optional)</label>
                                <input
                                    type="text"
                                    value={commitFileName}
                                    onChange={(e) => setCommitFileName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onCommitFile() }}
                                    placeholder="Use default identifier..."
                                    autoFocus
                                    disabled={isSavingSummary}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-50"
                                />
                            </div>

                            <div className="flex gap-3 relative z-10">
                                <button
                                    onClick={() => { setCommitModalOpen(false); }}
                                    disabled={isSavingSummary}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onCommitFile}
                                    disabled={isSavingSummary}
                                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSavingSummary ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Confirm Save'
                                    )}
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
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-[#0B1121] border border-white/10 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                            
                            <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10 flex-none bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-2xl">
                                        <Zap size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tightest">Neural Synopsis Details</h3>
                                        <p className="text-[11px] text-slate-500 font-medium tracking-wider">Comprehensive intelligence synthesis from your case units</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-hide text-slate-200 leading-relaxed font-medium">
                                <div className="whitespace-pre-wrap text-[15px] space-y-4">
                                    {caseSummary}
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5 flex gap-4 relative z-10 bg-white/[0.01] flex-none">
                                <button
                                    onClick={() => setIsSummaryModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-bold tracking-widest transition-all border border-white/5"
                                >
                                    CLOSE
                                </button>
                                <button
                                    onClick={onArchiveAsPdf}
                                    className="flex-1 px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl text-[11px] font-bold tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3"
                                >
                                    <Zap size={14} fill="currentColor" />
                                    ARCHIVE AS PDF
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
