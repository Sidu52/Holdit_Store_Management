"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/auth/AuthLayout";
import { useToast } from "../../../hooks/useToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { authApi } from "../../../services/authApi";
import { Landmark, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function CompleteProfileClient() {
  const router = useRouter();
  const toast = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Bank Details State
  const [bankData, setBankData] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    upiId: "",
    preferredMode: "IMPS",
  });

  useEffect(() => {
    // Route Protection Guard
    const isVerified = sessionStorage.getItem("auth_verified") === "true";
    const flow = sessionStorage.getItem("auth_flow");

    if (!isVerified || flow !== "signup") {
      // Not allowed to access this screen directly if not verified or not a signup flow
      router.replace("/signup");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Please fill in all personal information fields");
      return;
    }
    setStep(2);
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    // If account number provided, validate confirmation and IFSC
    if (bankData.accountNumber || bankData.confirmAccountNumber) {
      if (bankData.accountNumber !== bankData.confirmAccountNumber) {
        toast.error("Bank Account Numbers do not match");
        return;
      }
      if (!bankData.ifscCode) {
        toast.error("Please enter the Bank IFSC Code");
        return;
      }
      if (!bankData.beneficiaryName) {
        toast.error("Please enter the Beneficiary / Account Holder Name");
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: any = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      if (bankData.accountNumber || bankData.upiId) {
        payload.bankDetails = {
          beneficiaryName: bankData.beneficiaryName.trim(),
          accountNumber: bankData.accountNumber.trim(),
          ifscCode: bankData.ifscCode.trim().toUpperCase(),
          upiId: bankData.upiId.trim().toLowerCase() || null,
          preferredMode: bankData.preferredMode,
        };
      }

      await authApi.completeProfile(payload);
      
      toast.success("Profile setup completed successfully!");
      
      // Cleanup auth session tokens and redirect to dashboard
      sessionStorage.removeItem("auth_verified");
      sessionStorage.removeItem("auth_mobile");
      sessionStorage.removeItem("auth_flow");
      
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to complete profile. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" className="text-[#0D9488]" />
      </div>
    );
  }

  return (
    <AuthLayout 
      title={step === 1 ? "Complete Profile" : "Bank & Settlement Details"} 
      subtitle={step === 1 ? "Step 1 of 2: Personal Information" : "Step 2 of 2: Payout Credentials (Locked After Signup)"}
    >
      {step === 1 && (
        <form onSubmit={handleNextStep} className="flex flex-col gap-5 mt-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50"
                required
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 mt-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all"
          >
            Next: Bank Details
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleComplete} className="flex flex-col gap-5 mt-6">
          {/* Security Notice Banner */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Important Security Policy:</span> Bank details are captured during registration and locked for payout integrity. Store owners cannot modify bank details after setup. Any future modifications require Admin CRM / Support Team verification.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="beneficiaryName" className="text-sm font-semibold text-slate-700">
              Account Beneficiary Name
            </label>
            <input
              id="beneficiaryName"
              type="text"
              value={bankData.beneficiaryName}
              onChange={(e) => setBankData({ ...bankData, beneficiaryName: e.target.value })}
              placeholder="Official Bank Account Holder Name"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="accountNumber" className="text-sm font-semibold text-slate-700">
                Bank Account Number
              </label>
              <input
                id="accountNumber"
                type="password"
                value={bankData.accountNumber}
                onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                placeholder="Account Number"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 font-mono"
                required
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="confirmAccountNumber" className="text-sm font-semibold text-slate-700">
                Confirm Account Number
              </label>
              <input
                id="confirmAccountNumber"
                type="text"
                value={bankData.confirmAccountNumber}
                onChange={(e) => setBankData({ ...bankData, confirmAccountNumber: e.target.value })}
                placeholder="Re-enter Account Number"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="ifscCode" className="text-sm font-semibold text-slate-700">
                Bank IFSC Code
              </label>
              <input
                id="ifscCode"
                type="text"
                value={bankData.ifscCode}
                onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 uppercase font-mono"
                required
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="upiId" className="text-sm font-semibold text-slate-700">
                UPI ID (Optional)
              </label>
              <input
                id="upiId"
                type="text"
                value={bankData.upiId}
                onChange={(e) => setBankData({ ...bankData, upiId: e.target.value.toLowerCase() })}
                placeholder="e.g. store@oksbi"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Preferred Settlement Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {["IMPS", "UPI"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBankData({ ...bankData, preferredMode: mode })}
                  className={`h-11 rounded-xl font-bold text-xs border transition-all ${
                    bankData.preferredMode === mode
                      ? "bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-200/50"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {mode === "IMPS" ? "Bank Transfer (IMPS / NEFT)" : "Direct UPI Transfer"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl flex items-center justify-center transition-all disabled:opacity-70 shadow-sm"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Complete Registration & Lock Details"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full h-11 bg-transparent text-slate-500 hover:text-slate-700 text-xs font-semibold"
            >
              Back to Personal Info
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
