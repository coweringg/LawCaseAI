"use client";

import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Loader2, Edit2, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CaseHeader } from '@/components/dashboard/cases/CaseHeader';
import { CaseSidebar } from '@/components/dashboard/cases/CaseSidebar';
import { CaseChat } from '@/components/dashboard/cases/CaseChat';
import { CaseRightSidebar } from '@/components/dashboard/cases/CaseRightSidebar';
import { CaseModals } from '@/components/dashboard/cases/CaseModals';
import { TrialStatusBanner } from '@/components/cases/TrialStatusBanner';
import { LockedTrialOverlay } from '@/components/cases/LockedTrialOverlay';

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
        handleSendMessage, handleGenerateSummary, handleCloseCase,
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
                <div className="absolute inset-0 crystallography-pattern opacity-[0.03] pointer-events-none"></div>
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
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all mt-1"
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
