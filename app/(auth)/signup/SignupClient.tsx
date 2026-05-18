"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../../components/auth/AuthLayout";
import { useToast } from "../../../hooks/useToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { authApi } from "../../../services/authApi";

export default function SignupClient() {
  const router = useRouter();
  const toast = useToast();
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    
    setIsLoading(true);
    try {
      await authApi.ownerRegister(mobileNumber);
      // Store mobile number and role in session storage to verify later
      sessionStorage.setItem("auth_mobile", mobileNumber);
      sessionStorage.setItem("auth_flow", "signup");
      sessionStorage.setItem("auth_role", "store_owner");
      
      toast.success("OTP sent to your number!");
      router.push("/verify-otp");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to sign up";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Select a role and enter your mobile number to get started"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="mobileNumber" className="text-sm font-semibold text-slate-700">
            Mobile Number
          </label>
          <div className="flex flex-col gap-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium z-10">
              +91
            </div>
            <input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="000 000 0000"
              className="w-full h-14 pl-14 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 relative"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl flex items-center justify-center transition-all disabled:opacity-70 mt-2"
          disabled={isLoading || mobileNumber.length < 10}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "Send OTP"}
        </button>

        <div className="text-center mt-4">
          <span className="text-slate-500 text-sm">Already have an account? </span>
          <Link href="/login" className="text-[#0D9488] font-semibold text-sm hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
