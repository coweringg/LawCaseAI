"use client";

import React from 'react';
import {
  Users,
  Bell,
  Monitor,
  Terminal,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/helpers';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminStatsCards } from '@/components/dashboard/admin/AdminStatsCards';
import { AdminUsersTable } from '@/components/dashboard/admin/AdminUsersTable';
import { AdminAuditLogs } from '@/components/dashboard/admin/AdminAuditLogs';
import { AdminSupportRequests } from '@/components/dashboard/admin/AdminSupportRequests';
import { AdminModals } from '@/components/dashboard/admin/AdminModals';

export default function AdminDashboardPage() {
  const {
    users, searchTerm, setSearchTerm, roleFilter, setRoleFilter,
    userPage, setUserPage, userTotalPages, selectedUser, setSelectedUser,
    showEditModal, setShowEditModal, showHistoryModal, setShowHistoryModal,
    userHistory, isHistoryLoading, editData, setEditData, editError, isUpdating,
    activeTab, setActiveTab, activeHistoryTab, setActiveHistoryTab,
    activeDetailTab, setActiveDetailTab, adminLogs, platformLogs, isLogsLoading,
    logSearchTerm, setLogSearchTerm, startDate, setStartDate, endDate, setEndDate,
    actionFilter, setActionFilter, targetTypeFilter, setTargetTypeFilter, logPage, setLogPage,
    totalPages, showDiffModal, setShowDiffModal, selectedLogForDiff, setSelectedLogForDiff,
    supportRequests, isSupportLoading, supportTypeFilter, setSupportTypeFilter,
    supportStatusFilter, setSupportStatusFilter, signalSubTab, setSignalSubTab,
    publicSubjectFilter, setPublicSubjectFilter, supportPage, setSupportPage,
    supportTotalPages, selectedSupportRequest, setSelectedSupportRequest,
    showSupportDetailModal, setShowSupportDetailModal, confirmConfig, setConfirmConfig,
    showPlanModal, setShowPlanModal, isPlanUpdating, handleExportCSV, fetchAuditLogs,
    handleDeleteLog, handleClearLogs, handleUpdatePlan, fetchUserHistory,
    handleUserStatusChange, handleDeleteUser, handleForceLogout, handleEditSubmit,
    handleResolveSupport, handleDeleteSupport, handleClearSupport, openEditModal,
    user, isAuthLoading, fetchSupportRequests, fetchUsers, fetchStats, isLoading,
    stats, setUserHistory
  } = useAdminDashboard();

  if (isAuthLoading || !user || user.role !== 'admin' || isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {isAuthLoading ? 'Verifying Security Access...' : 'Retrieving Administrative Data...'}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col p-8 md:p-12 gap-12">
        <div className="absolute inset-0 crystallography-pattern opacity-[0.03] scale-150 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Administrative Nexus</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tightest leading-none font-display uppercase italic bg-gradient-to-r from-white via-white to-white/20 bg-clip-text text-transparent">
              Command Suite
            </h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> System Authorization Level: Alpha-One
            </p>
          </div>

          <div className="flex gap-4">
             <Button 
                variant="none" 
                className="premium-glass h-14 px-8 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/5 transition-all flex items-center gap-3"
             >
                <Monitor size={18} className="text-primary" />
                Network Status: Active
             </Button>
          </div>
        </div>

        <AdminStatsCards stats={stats} />

        <div className="relative z-10 flex flex-wrap gap-4 premium-glass p-2 rounded-3xl border border-white/10 shadow-2xl w-fit">
          {[
            { id: 'users', label: 'User Identity Nexus', icon: Users },
            { id: 'history', label: 'Protocol Archives', icon: Terminal },
            { id: 'support', label: 'Logic Signal Feed', icon: Bell }
          ].map((tab) => (
            <motion.button
              whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                activeTab === tab.id 
                ? "bg-primary text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-white/20" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <AdminUsersTable
              users={users}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              roleFilter={roleFilter} setRoleFilter={setRoleFilter}
              userPage={userPage} setUserPage={setUserPage} userTotalPages={userTotalPages}
              setSelectedUser={setSelectedUser}
              setShowHistoryModal={setShowHistoryModal}
              setShowPlanModal={setShowPlanModal}
              fetchUserHistory={fetchUserHistory}
              openEditModal={openEditModal}
              handleUserStatusChange={handleUserStatusChange}
              handleDeleteUser={handleDeleteUser}
            />
          ) : activeTab === 'history' ? (
            <AdminAuditLogs
              adminLogs={adminLogs} platformLogs={platformLogs}
              activeHistoryTab={activeHistoryTab} setActiveHistoryTab={setActiveHistoryTab}
              logSearchTerm={logSearchTerm} setLogSearchTerm={setLogSearchTerm}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              actionFilter={actionFilter} setActionFilter={setActionFilter}
              targetTypeFilter={targetTypeFilter} setTargetTypeFilter={setTargetTypeFilter}
              logPage={logPage} setLogPage={setLogPage} totalPages={totalPages}
              isLogsLoading={isLogsLoading}
              setSelectedLogForDiff={setSelectedLogForDiff} setShowDiffModal={setShowDiffModal}
              handleExportCSV={handleExportCSV}
              handleDeleteLog={handleDeleteLog} handleClearLogs={handleClearLogs}
              fetchAuditLogs={fetchAuditLogs}
            />
          ) : activeTab === 'support' ? (
            <AdminSupportRequests
              supportRequests={supportRequests}
              signalSubTab={signalSubTab} setSignalSubTab={setSignalSubTab}
              supportTypeFilter={supportTypeFilter} setSupportTypeFilter={setSupportTypeFilter}
              supportStatusFilter={supportStatusFilter} setSupportStatusFilter={setSupportStatusFilter}
              publicSubjectFilter={publicSubjectFilter} setPublicSubjectFilter={setPublicSubjectFilter}
              supportPage={supportPage} setSupportPage={setSupportPage} supportTotalPages={supportTotalPages}
              isSupportLoading={isSupportLoading}
              setSelectedSupportRequest={setSelectedSupportRequest}
              setShowSupportDetailModal={setShowSupportDetailModal}
              handleResolveSupport={handleResolveSupport}
              handleDeleteSupport={handleDeleteSupport}
              handleClearSupport={handleClearSupport}
              fetchSupportRequests={fetchSupportRequests}
            />
          ) : (
            <motion.div 
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 opacity-40 flex flex-col items-center gap-6"
            >
              <Lock size={48} className="text-slate-700" />
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none">Module Offline &bull; Access Level Zero</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminModals
        showHistoryModal={showHistoryModal} setShowHistoryModal={setShowHistoryModal}
        selectedUser={selectedUser} setSelectedUser={setSelectedUser}
        userHistory={userHistory} setUserHistory={setUserHistory}
        isHistoryLoading={isHistoryLoading}
        activeDetailTab={activeDetailTab} setActiveDetailTab={setActiveDetailTab}
        fetchUserHistory={fetchUserHistory}
        showDiffModal={showDiffModal} setShowDiffModal={setShowDiffModal}
        selectedLogForDiff={selectedLogForDiff} setSelectedLogForDiff={setSelectedLogForDiff}
        showEditModal={showEditModal} setShowEditModal={setShowEditModal}
        editData={editData} setEditData={setEditData}
        handleEditSubmit={handleEditSubmit} isUpdating={isUpdating} editError={editError}
        showPlanModal={showPlanModal} setShowPlanModal={setShowPlanModal}
        handleUpdatePlan={handleUpdatePlan} isPlanUpdating={isPlanUpdating}
        showSupportDetailModal={showSupportDetailModal} setShowSupportDetailModal={setShowSupportDetailModal}
        selectedSupportRequest={selectedSupportRequest} setSelectedSupportRequest={setSelectedSupportRequest}
        handleResolveSupport={handleResolveSupport}
        confirmConfig={confirmConfig} setConfirmConfig={setConfirmConfig}
        openEditModal={openEditModal}
        handleForceLogout={handleForceLogout}
      />
    </DashboardLayout>
  );
}
