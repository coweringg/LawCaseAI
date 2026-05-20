"use client";

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit2, Loader2, Trash2, Zap } from 'lucide-react';

import { LockedTrialOverlay } from '@/components/cases/LockedTrialOverlay';
import { TrialStatusBanner } from '@/components/cases/TrialStatusBanner';
import { CaseChat } from '@/components/dashboard/cases/CaseChat';
import { CaseHeader } from '@/components/dashboard/cases/CaseHeader';
import { CaseModals } from '@/components/dashboard/cases/CaseModals';
import { CaseRightSidebar } from '@/components/dashboard/cases/CaseRightSidebar';
import { CaseSidebar } from '@/components/dashboard/cases/CaseSidebar';

import { useCaseWorkspace } from '@/hooks/useCaseWorkspace';

export default function CaseClient() {
    const {
        activeTab, setActiveTab,
        isLoading, isAuthLoading, mounted,
        isSending, isLoadingSummary, isSavingSummary, isUploadingTemp,
        isDraggingChat, setIsDraggingChat, isDraggingSidebar, setIsDraggingSidebar,
        caseData, files, chatMessages, userInput, setUserInput,
        caseSummary, isTrialCase, isTrialExpired, isCaseLocked,
        isConfirmModalOpen, setIsConfirmModalOpen,
        commitModalOpen, setCommitModalOpen,
        renameModalOpen, setRenameModalOpen,
        deleteModalOpen, setDeleteModalOpen,
        isSummaryModalOpen, setIsSummaryModalOpen,
        attachingFile, setAttachingFile,
        temporaryFileId, setTemporaryFileId,
        fileToCommit, setFileToCommit,
        commitFileName, setCommitFileName,
        summaryToSave, setSummaryToSave,
        fileToRename, setFileToRename,
        newFileName, setNewFileName,
        fileToDelete, setFileToDelete,
        activeFileMenu, setActiveFileMenu,
        fileInputRef, chatEndRef,
        handleOpenFile, handleDownloadFile,
        handleAttachFile, handleDragOver, handleDragLeave, handleDrop,
        handleSaveSummary, executeCommitFile, handleDeleteFile, handleRenameFile,
        handleSendMessage, handleRegenerateLastMessage, handleGenerateSummary, handleCloseCase,
        threads, activeThreadId,
        handleSwitchThread, handleCreateThread, handleRenameThread, handleDeleteThread,
        renameThreadModalOpen, setRenameThreadModalOpen,
        threadToRename, setThreadToRename,
        newThreadTitle, setNewThreadTitle,
        id
    } = useCaseWorkspace();

    if (!mounted || isAuthLoading || isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                initial={false}
                animate="visible"
                className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden relative"
            >
                <div className="absolute inset-0 micro-grid opacity-30 pointer-events-none"></div>
                {isTrialExpired && <LockedTrialOverlay status={caseData?.status} />}

                <CaseHeader
                    caseData={caseData}
                    isTrialExpired={isTrialExpired}
                    onCloseCase={() => setIsConfirmModalOpen(true)}
                />

                {isTrialCase && !isTrialExpired && (
                    <TrialStatusBanner
                        hoursRemaining={24}
                        docsCount={files.length}
                        maxDocs={10}
                    />
                )}

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {isCaseLocked && <LockedTrialOverlay isTrialExpired={isTrialExpired} closedByUser={caseData?.closedByUser} status={caseData?.status} />}

                    <CaseSidebar
                        id={id as string}
                        files={files}
                        isDraggingSidebar={isDraggingSidebar}
                        onDragOver={(e) => handleDragOver(e, setIsDraggingSidebar)}
                        onDragLeave={(e) => handleDragLeave(e, setIsDraggingSidebar)}
                        onDrop={(e) => handleDrop(e, false, setIsDraggingSidebar)}
                        onOpenFile={handleOpenFile}
                        activeFileMenuId={activeFileMenu?.id}
                        onFileMenuClick={(e, f) => {
                            e.stopPropagation();
                            if (activeFileMenu?.id === f._id) {
                                setActiveFileMenu(null);
                            } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveFileMenu({ id: f._id, x: rect.right + 10, y: rect.top - 10 });
                            }
                        }}
                    />

                    <CaseChat
                        chatMessages={chatMessages}
                        userInput={userInput}
                        isSending={isSending}
                        isDraggingChat={isDraggingChat}
                        isCaseLocked={isCaseLocked}
                        attachingFile={attachingFile}
                        isUploadingTemp={isUploadingTemp}
                        temporaryFileId={temporaryFileId}
                        onSendMessage={handleSendMessage}
                        onInputChange={setUserInput}
                        onDragOver={(e) => handleDragOver(e, setIsDraggingChat)}
                        onDragLeave={(e) => handleDragLeave(e, setIsDraggingChat)}
                        onDrop={(e) => handleDrop(e, true, setIsDraggingChat)}
                        onAttachClick={() => fileInputRef.current?.click()}
                        onRemoveAttach={() => { setAttachingFile(null); setTemporaryFileId(null); }}
                        onSaveSummary={handleSaveSummary}
                        onOpenFile={handleOpenFile}
                        chatEndRef={chatEndRef}
                        files={files}
                        threads={threads}
                        activeThreadId={activeThreadId}
                        onSwitchThread={handleSwitchThread}
                        onCreateThread={handleCreateThread}
                        onRenameThread={(thread: any) => {
                            setThreadToRename(thread);
                            setNewThreadTitle(thread.title);
                            setRenameThreadModalOpen(true);
                        }}
                        onDeleteThread={handleDeleteThread}
                        onRegenerateLastMessage={handleRegenerateLastMessage}
                    />

                    <CaseRightSidebar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        caseData={caseData}
                        caseSummary={caseSummary}
                        isLoadingSummary={isLoadingSummary}
                        onGenerateSummary={handleGenerateSummary}
                        onViewFullAnalysis={() => setIsSummaryModalOpen(true)}
                        isUploadingTemp={isUploadingTemp}
                        temporaryFileId={temporaryFileId}
                        filesCount={files.length}
                    />
                </div>

                <CaseModals
                    isConfirmModalOpen={isConfirmModalOpen}
                    setIsConfirmModalOpen={setIsConfirmModalOpen}
                    onConfirmCloseCase={handleCloseCase}
                    caseData={caseData}
                    deleteModalOpen={deleteModalOpen}
                    setDeleteModalOpen={setDeleteModalOpen}
                    onDeleteFile={handleDeleteFile}
                    fileToDelete={fileToDelete}
                    renameModalOpen={renameModalOpen}
                    setRenameModalOpen={setRenameModalOpen}
                    onRenameFile={handleRenameFile}
                    newFileName={newFileName}
                    setNewFileName={setNewFileName}
                    commitModalOpen={commitModalOpen}
                    setCommitModalOpen={setCommitModalOpen}
                    onCommitFile={executeCommitFile}
                    commitFileName={commitFileName}
                    setCommitFileName={setCommitFileName}
                    isSavingSummary={isSavingSummary}
                    summaryToSave={summaryToSave}
                    isSummaryModalOpen={isSummaryModalOpen}
                    setIsSummaryModalOpen={setIsSummaryModalOpen}
                    caseSummary={caseSummary}
                    onArchiveAsPdf={() => {
                        setIsSummaryModalOpen(false);
                        handleSaveSummary(caseSummary || '', 'application/pdf');
                    }}
                />

                <AnimatePresence>
                    {renameThreadModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                                onClick={() => setRenameThreadModalOpen(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[420px] premium-glass border border-white/10 rounded-[2rem] p-8 shadow-2xl"
                            >
                                <h3 className="text-lg font-black text-white tracking-tightest mb-1">Rename Thread</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Update the conversation identity</p>
                                <input
                                    type="text"
                                    value={newThreadTitle}
                                    onChange={(e) => setNewThreadTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleRenameThread(); }}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-[13px] font-bold text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder-slate-600"
                                    placeholder="Thread title..."
                                />
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setRenameThreadModalOpen(false)}
                                        className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRenameThread}
                                        className="px-6 py-2.5 bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAttachFile}
                />

                <AnimatePresence>
                    {activeFileMenu && (
                        <>
                            <div className="fixed inset-0 z-[100]" onClick={() => setActiveFileMenu(null)}></div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                className="fixed z-[101] w-48 bg-[#0B1121] border border-white/10 rounded-2xl shadow-2xl p-2 premium-glass"
                                style={{ top: activeFileMenu.y, left: activeFileMenu.x }}
                            >
                                <button
                                    onClick={() => {
                                        const file = files.find((f: any) => f._id === activeFileMenu.id);
                                        setFileToRename(file);
                                        setNewFileName(file?.name || '');
                                        setRenameModalOpen(true);
                                        setActiveFileMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <Edit2 size={14} className="text-primary" />
                                    Update Identity
                                </button>
                                <button
                                    onClick={() => {
                                        const file = files.find((f: any) => f._id === activeFileMenu.id);
                                        if (file) handleDownloadFile(file.url, file.name);
                                        setActiveFileMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all mt-1"
                                >
                                    <Zap size={14} className="text-primary" />
                                    Download Unit
                                </button>
                                <button
                                    onClick={() => {
                                        const file = files.find((f: any) => f._id === activeFileMenu.id);
                                        setFileToDelete(file);
                                        setDeleteModalOpen(true);
                                        setActiveFileMenu(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all mt-1"
                                >
                                    <Trash2 size={14} />
                                    Purge Signal
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </DashboardLayout>
    );
}
