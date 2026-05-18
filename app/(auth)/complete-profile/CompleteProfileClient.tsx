"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/auth/AuthLayout";
import { useToast } from "../../../hooks/useToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

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

  const handleComplete = async (skipped: boolean = false) => {
    setIsLoading(true);
    try {
      // Simulate Final Onboarding API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(skipped ? "Profile setup completed without documents" : "Profile and documents submitted!");
      
      // Cleanup auth session tokens and redirect to dashboard
      sessionStorage.removeItem("auth_verified");
      sessionStorage.removeItem("auth_mobile");
      sessionStorage.removeItem("auth_flow");
      
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to complete profile. Try again.");
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
      title={step === 1 ? "Complete Profile" : "Upload Documents"} 
      subtitle={step === 1 ? "Step 1 of 2: Personal Information" : "Step 2 of 2: Additional Documents (Optional)"}
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
            Next Step
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 mt-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-[#EAFBF6] text-[#0D9488] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Click to upload document</p>
            <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max. 5MB)</p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={() => handleComplete(false)}
              disabled={isLoading}
              className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl flex items-center justify-center transition-all disabled:opacity-70"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Submit Forms"}
            </button>
            <button
              onClick={() => handleComplete(true)}
              disabled={isLoading}
              className="w-full h-14 bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl flex items-center justify-center transition-all disabled:opacity-70"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
