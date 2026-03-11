import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import api from "@/utils/api";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getPaddleInstance } from "@/utils/paddle";
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

import {
  useOrganizationDetails,
  useBillingInfo,
  usePurchaseHistory,
  useOrganizationMembers,
} from "@/hooks/useSettings";

export default function Settings() {
  const { user, updateProfile, changePassword, logout, fetchProfile } =
    useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'profile';
    }
    return 'profile';
  });
  const [mounted, setMounted] = useState(false);
  const [paddle, setPaddle] = useState<Paddle>();

  const { data: orgData, refetch: refetchOrg } = useOrganizationDetails(
    activeTab === "organization" && !!user?.isOrgAdmin,
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

  useEffect(() => {
    if (router.isReady && router.query.openPlan === "true") {
      const planId = router.query.planId as string;
      const tab = router.query.tab as string;
      const interval = router.query.interval as string;
      const seats = router.query.seats as string;

      if (tab) setActiveTab(tab);

      if (
        user?.organizationId &&
        !user?.isOrgAdmin &&
        (tab === "billing" || router.query.openPlan === "true")
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

      const {
        openPlan,
        planId: _,
        tab: __,
        interval: ___,
        seats: ____,
        ...rest
      } = router.query;
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      });
    }
  }, [
    router.isReady,
    router.query,
    user?.isOrgAdmin,
    user?.organizationId,
    router,
  ]);

  if (!mounted) return null;

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

  const validateLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;
    let sum = 0,
      shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const getCardBrand = (number: string): string => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'American Express';
    if (firstDigit === '6') return 'Discover';
    return 'Credit Card';
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlanId) {
      toast.error("Please select a plan first.");
      return;
    }

    setIsProcessingPayment(true);

    if (!paddle) {
      // Mock Checkout mode for local development without token
      try {
        const { data: response } = await api.post("/payments/mock-checkout", {
          planId: selectedPlanId,
          seats: planSeats,
          interval: billingInterval,
          firmName: paymentData.firmName
        });

        if (response.success) {
          toast.success(response.message);
          setIsPlanModalOpen(false);
          window.location.href = response.data?.redirectUrl || '/dashboard?status=success';
        } else {
          toast.error(response.message || 'Mock checkout failed');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Mock checkout error");
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    try {
      const { data: response } = await api.post("/payments/checkout", {
        planId: selectedPlanId,
        seats: planSeats,
        interval: billingInterval,
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
          successUrl: `${window.location.origin}/dashboard?status=success`
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
          successUrl: `${window.location.origin}/settings?tab=organization`
        }
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to increase capacity");
    } finally {
      setIsIncreasingSeats(false);
    }
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

  return (
    <ProtectedRoute>
      <Head>
        <title>LawCaseAI - Settings</title>
      </Head>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto space-y-6 relative z-10"
        >
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight font-display mb-2">
              System Configuration
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em]">
              Neural Interface • Security Protocols • Billing Units
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <SettingsSidebar
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={(id) => {
                setActiveTab(id);
                router.push({ query: { ...router.query, tab: id } }, undefined, {
                  shallow: true,
                });
              }}
              user={user}
              onLogout={logout}
              onOpenSupport={() => setIsSupportModalOpen(true)}
            />

            <div className="lg:col-span-3 space-y-4">
              {activeTab === "profile" && (
                <ProfileSection user={user} updateProfile={updateProfile} />
              )}
              {activeTab === "security" && (
                <SecuritySection changePassword={changePassword} />
              )}
              {activeTab === "organization" && user?.isOrgAdmin && (
                <OrganizationSection
                  orgData={orgData}
                  isLoadingOrg={!!isLoadingMembers || !orgData}
                  members={members || []}
                  isLoadingMembers={isLoadingMembers}
                  onRefreshMembers={refetchMembers}
                  onRemoveMember={handleRemoveMember}
                  onIncreaseCapacity={() => setIsCapacityModalOpen(true)}
                  currentUserId={user?.id || ""}
                />
              )}
              {activeTab === "billing" && (
                <BillingSection
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
                  formatDate={(d) => new Date(d).toLocaleDateString()}
                />
              )}
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

        <CapacityModal
          isOpen={isCapacityModalOpen}
          onClose={() => setIsCapacityModalOpen(false)}
          additionalSeats={additionalSeats}
          setAdditionalSeats={setAdditionalSeats}
          paymentData={paymentData}
          setPaymentData={setPaymentData}
          isProcessing={isIncreasingSeats}
          onConfirm={handleIncreaseCapacity}
          billingInfo={billingInfo}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
