"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getPaddleInstance } from "@/lib/paddle";
import { Paddle } from "@paddle/paddle-js";

import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { OrganizationSection } from "@/components/settings/OrganizationSection";
import { BillingSection } from "@/components/settings/BillingSection";
import { SupportModal } from "@/components/settings/SupportModal";
import { ConfirmModal } from "@/components/settings/ConfirmModal";
import { PlanModal } from "@/components/settings/PlanModal";
import { CapacityModal } from "@/components/settings/CapacityModal";
import { DowngradeCapacityModal } from "@/components/settings/DowngradeCapacityModal";
import { ShieldAlert } from "lucide-react";

import {
  useOrganizationDetails,
  useBillingInfo,
  usePurchaseHistory,
  useOrganizationMembers,
} from "@/hooks/useSettings";

function SettingsContent() {
  const { user, updateProfile, changePassword, logout, updateUser, fetchProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const activeTab = searchParams?.get('tab') || 'profile';
  const setActiveTab = (id: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('tab', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [mounted, setMounted] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();

  const { data: orgData, refetch: refetchOrg } = useOrganizationDetails(
    (activeTab === "organization" || activeTab === "billing") && !!user?.isOrgAdmin,
  );
  const { data: billingInfo, refetch: refetchBilling } = useBillingInfo();
  const { data: purchaseHistory } = usePurchaseHistory();
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useOrganizationMembers(
    activeTab === "organization" && !!user?.isOrgAdmin,
  );

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [downgradeSeatsCount, setDowngradeSeatsCount] = useState(1);
  const [isProcessingDowngrade, setIsProcessingDowngrade] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info" as "danger" | "warning" | "info",
  });

  const [supportData, setSupportData] = useState({
    type: "system_error",
    subject: "",
    description: "",
  });
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [modalStep, setModalStep] = useState<"selection" | "checkout">(
    "selection",
  );
  const [planCategory, setPlanCategory] = useState<"personal" | "enterprise">(
    "personal",
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">(
    (user?.billingInterval as "monthly" | "annual") || "monthly",
  );
  const [planSeats, setPlanSeats] = useState(5);
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    firmName: "",
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [isIncreasingSeats, setIsIncreasingSeats] = useState(false);

  useEffect(() => {
    if (user?.billingInterval) {
      setBillingInterval(user.billingInterval as "monthly" | "annual");
    } else if (billingInfo?.billingInterval) {
      setBillingInterval(billingInfo.billingInterval as "monthly" | "annual");
    }
  }, [user?.billingInterval, billingInfo?.billingInterval]);

  useEffect(() => {
    setMounted(true);
    getPaddleInstance().then((p) => {
      if (p) setPaddle(p);
    });
  }, []);

  useEffect(() => {
    if (mounted && user?.organizationId && !user?.isOrgAdmin && activeTab === "billing") {
      setActiveTab("profile");
      router.replace("/settings?tab=profile");
    }
  }, [mounted, user, activeTab, router]);

  const hasProcessedSuccess = useRef(false);
  
  useEffect(() => {
    if (mounted && searchParams?.get('openPlan') === "true") {
      const planId = searchParams?.get('planId');
      const tab = searchParams?.get('tab');
      const interval = searchParams?.get('interval');
      const seats = searchParams?.get('seats');

      if (tab) setActiveTab(tab);

      if (
        user?.organizationId &&
        !user?.isOrgAdmin &&
        (tab === "billing" || searchParams?.get('openPlan') === "true")
      ) {
        router.replace("/settings?tab=profile");
        return;
      }

      if (planId) {
        setSelectedPlanId(planId);
        setPlanCategory(planId === "enterprise" ? "enterprise" : "personal");
        setModalStep("checkout");
        setIsPlanModalOpen(true);
      } else {
        setModalStep("selection");
        setIsPlanModalOpen(true);
      }

      if (interval === "annual") setBillingInterval("annual");
      if (seats) setPlanSeats(parseInt(seats));

      const params = new URLSearchParams(searchParams?.toString());
      params.delete('openPlan');
      params.delete('planId');
      params.delete('interval');
      params.delete('seats');
      router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`);
    }

    if (mounted && searchParams?.get('status') === 'success' && !hasProcessedSuccess.current) {
      hasProcessedSuccess.current = true;
      const isOrgTab = searchParams?.get('tab') === 'organization';
      
      const loadingToast = toast.loading("Updating account permissions...");
      
      (async () => {
        try {
          let updatedUser = null;
          let attempts = 0;
          const maxAttempts = 15;
          
          while (attempts < maxAttempts) {
            updatedUser = await fetchProfile();
            
            if (isOrgTab && updatedUser?.isOrgAdmin) break;
            if (!isOrgTab && updatedUser?.plan !== 'none') break;
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          await refetchOrg();
          await refetchBilling();
          
          toast.success("Payment successful! Your account has been updated.", { id: loadingToast });
          
          const params = new URLSearchParams(searchParams?.toString());
          params.delete('status');
          router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`);
        } catch (error) {
          toast.error("Error refreshing profile. Please reload the page.", { id: loadingToast });
          const params = new URLSearchParams(searchParams?.toString());
          params.delete('status');
          router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`);
        }
      })();
    }
  }, [mounted, searchParams, user, router, pathname]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSupport(true);
    try {
      const response = await api.post("/user/support", supportData);
      if (response.status === 201 || response.status === 200) {
        toast.success(
          supportData.type === "system_error"
            ? "Support request submitted."
            : "Feedback received.",
        );
        setIsSupportModalOpen(false);
        setSupportData({ type: "system_error", subject: "", description: "" });
      }
    } catch (error) {
      toast.error("Failed to submit support request");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const handleConfirmPurchase = async (planIdParam?: string) => {
    const planToProcess = typeof planIdParam === "string" ? planIdParam : selectedPlanId;
    if (!planToProcess) {
      toast.error("Please select a plan first.");
      return;
    }

    setIsProcessingPayment(true);

    if (!paddle) {
      toast.error("Preparation incomplete or Paddle failed to load.");
      setIsProcessingPayment(false);
      return;
    }

    try {
      const { data: response } = await api.post("/payments/checkout", {
        planId: planToProcess,
        seats: planSeats,
        interval: billingInterval,
        firmName: paymentData.firmName
      });

      if (!response.success || !response.data?.transactionId) {
        throw new Error(response.message || "Failed to initialize payment gateway");
      }

      setIsPlanModalOpen(false);
      paddle.Checkout.open({
        transactionId: response.data.transactionId,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          successUrl: planToProcess === 'enterprise' 
            ? `${window.location.origin}/settings?tab=organization&status=success`
            : `${window.location.origin}/dashboard?status=success`
        }
      });
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Payment error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Neural Disconnection",
      message: "Are you sure you want to remove this member?",
      type: "danger",
      onConfirm: async () => {
        try {
          const response = await api.delete(`/payments/members/${memberId}`);
          if (response.data.success) {
            toast.success("Member removed");
            refetchMembers();
            refetchOrg();
          }
        } catch (error) {
          toast.error("Failed to remove member");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleIncreaseCapacity = async () => {
    if (!paddle) {
      toast.error("Initialization incomplete. Please try again.");
      return;
    }
    setIsIncreasingSeats(true);
    try {
      const { data: response } = await api.post("/payments/checkout", {
        planId: "enterprise",
        seats: additionalSeats,
        interval: billingInterval,
      });

      if (!response.success || !response.data?.transactionId) {
         throw new Error(response.message || "Failed to initialize payment gateway");
      }

      setIsCapacityModalOpen(false);
      paddle.Checkout.open({
        transactionId: response.data.transactionId,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          successUrl: `${window.location.origin}/settings?tab=organization&status=success`
        }
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to increase capacity");
    } finally {
      setIsIncreasingSeats(false);
    }
  };

  const handleDowngradeSeats = async () => {
    const unusedSeats = (orgData?.totalSeats || 0) - (orgData?.usedSeats || 0);
    if (unusedSeats <= 0) {
      toast.error("No unused seats to remove.");
      return;
    }
    setDowngradeSeatsCount(1);
    setIsDowngradeModalOpen(true);
  };

  const confirmDowngradeSeats = async () => {
    try {
      setIsProcessingDowngrade(true);
      const res = await api.post('/payments/downgrade', { seatsToRemove: downgradeSeatsCount });
      if (res.data.success) {
        toast.success(res.data.message);
        refetchOrg();
        refetchBilling();
        setIsDowngradeModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Failed to remove seats");
    } finally {
      setIsProcessingDowngrade(false);
    }
  };

  const handleCancelSubscription = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Subscription",
      message: "Are you sure you want to cancel your subscription? It will remain active until the end of your current billing cycle.",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await api.post('/payments/cancel');
          if (res.data.success) {
            toast.success(res.data.message);
            
            // Re-fetch all data to ensure UI consistency
            await fetchProfile();
            await refetchOrg();
            await refetchBilling();
            
            // Manual state update as fallback to ensure immediate button disable
            updateUser({ willCancelAtPeriodEnd: true });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || error.message || "Failed to cancel subscription");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "person", color: "primary" },
    ...(user?.isOrgAdmin
      ? [
          {
            id: "organization",
            label: "Firm Management",
            icon: "business",
            color: "primary",
          },
        ]
      : []),
    ...(!(user?.organizationId && !user?.isOrgAdmin)
      ? [
          {
            id: "billing",
            label: "Billing & Plans",
            icon: "credit_card",
            color: "primary",
          },
        ]
      : []),
    { id: "security", label: "Security", icon: "security", color: "primary" },
  ];

  if (!mounted) return (
    <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6 relative z-10"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight font-display mb-2">
            Settings
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em]">
            Profile • Security • Billing • Organization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SettingsSidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onLogout={logout}
            onOpenSupport={() => setIsSupportModalOpen(true)}
          />

          <div className="lg:col-span-3 overflow-hidden">
            {(activeTab === 'billing') && (user?.willCancelAtPeriodEnd || 
              orgData?.willCancelAtPeriodEnd || 
              billingInfo?.willCancelAtPeriodEnd || 
              billingInfo?.organization?.willCancelAtPeriodEnd ||
              orgData?.status === 'canceled' ||
              billingInfo?.status === 'canceled' ||
              billingInfo?.organization?.status === 'canceled'
             ) && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-start gap-4 mb-8"
                >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Subscription Scheduled for Cancellation</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            You canceled your subscription on <span className="text-white font-bold">{new Date((user as any)?.canceledAt || orgData?.canceledAt || billingInfo?.canceledAt || billingInfo?.organization?.canceledAt || Date.now()).toLocaleDateString()}</span>. 
                            Your access will remain active until <span className="text-white font-bold">{new Date((user as any)?.currentPeriodEnd || orgData?.currentPeriodEnd || billingInfo?.currentPeriodEnd || billingInfo?.organization?.currentPeriodEnd || Date.now()).toLocaleDateString()}</span>. 
                            After this date, no further charges will be processed and your plan will revert to the evaluation tier.
                        </p>
                    </div>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <ProfileSection key="profile" user={user} updateProfile={updateProfile} />
              )}
              {activeTab === "security" && (
                <SecuritySection key="security" changePassword={changePassword} />
              )}
              {activeTab === "organization" && user?.isOrgAdmin && (
                <OrganizationSection
                  key="organization"
                  orgData={orgData}
                  isLoadingOrg={!!isLoadingMembers || !orgData}
                  members={members || []}
                  isLoadingMembers={isLoadingMembers}
                  onRefreshMembers={refetchMembers}
                  onRemoveMember={handleRemoveMember}
                  onIncreaseCapacity={() => setIsCapacityModalOpen(true)}
                  onDowngradeCapacity={handleDowngradeSeats}
                  onCancelSubscription={handleCancelSubscription}
                  currentUserId={user?.id || ""}
                />
              )}
              {activeTab === "billing" && (
                <BillingSection
                  key="billing"
                  billingInfo={billingInfo}
                  orgData={orgData}
                  purchaseHistory={purchaseHistory || []}
                  isLoadingHistory={!purchaseHistory}
                  isTrialUsed={user?.isTrialUsed}
                  onUpgradePlan={() => {
                    setModalStep("selection");
                    setIsPlanModalOpen(true);
                  }}
                  onUpdatePayment={() => {}}
                  onSetDefaultCard={() => {}}
                  onRemoveCard={() => {}}
                  formatDate={(d: any) => {
                    if (!d) return "Processing...";
                    const date = new Date(d);
                    return isNaN(date.getTime()) ? "Processing..." : date.toLocaleDateString();
                  }}
                  onCancelSubscription={handleCancelSubscription}
                  user={user}
                />
              )}
              {activeTab === "organization" && !user?.isOrgAdmin && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Firm Permissions...</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        supportData={supportData}
        setSupportData={setSupportData}
        onSubmit={handleSupportSubmit}
        isSubmitting={isSubmittingSupport}
      />

      <ConfirmModal
        {...confirmModal}
        onClose={() =>
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        step={modalStep}
        setStep={setModalStep}
        category={planCategory}
        setCategory={setPlanCategory}
        interval={billingInterval}
        setInterval={setBillingInterval}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        planSeats={planSeats}
        setPlanSeats={setPlanSeats}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
        isProcessing={isProcessingPayment}
        onConfirm={handleConfirmPurchase}
        billingInfo={billingInfo}
        user={user}
      />

      <DowngradeCapacityModal
        isOpen={isDowngradeModalOpen}
        onClose={() => setIsDowngradeModalOpen(false)}
        seatsToRemove={downgradeSeatsCount}
        setSeatsToRemove={setDowngradeSeatsCount}
        maxAvailable={(orgData?.totalSeats || 0) - (orgData?.usedSeats || 0)}
        isProcessing={isProcessingDowngrade}
        onConfirm={confirmDowngradeSeats}
      />
    </DashboardLayout>
  );
}

export default function SettingsClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05060a]" />}>
      <SettingsContent />
    </Suspense>
  );
}
