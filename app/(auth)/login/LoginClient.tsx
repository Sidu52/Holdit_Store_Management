"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../../components/auth/AuthLayout";
import { useToast } from "../../../hooks/useToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { authApi } from "../../../services/authApi";

export default function LoginClient() {
  const router = useRouter();
  const toast = useToast();
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<"store" | "store_owner">("store_owner");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    
    setIsLoading(true);
    try {
      if (role === "store_owner") {
        await authApi.ownerLogin(mobileNumber);
      } else {
        await authApi.storeLogin(mobileNumber);
      }
      
      // Store info across steps
      sessionStorage.setItem("auth_mobile", mobileNumber);
      sessionStorage.setItem("auth_flow", "login");
      sessionStorage.setItem("auth_role", role);
      
      toast.success("OTP sent successfully!");
      router.push("/verify-otp");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Select your role and enter your mobile number to sign in"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-6">
        
        {/* Role Selection Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setRole("store_owner")}
            className={`flex-1 flex justify-center items-center h-10 text-sm font-semibold rounded-lg transition-all ${
              role === "store_owner" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Store Owner
          </button>
          <button
            type="button"
            onClick={() => setRole("store")}
            className={`flex-1 flex justify-center items-center h-10 text-sm font-semibold rounded-lg transition-all ${
              role === "store" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Store Manager
          </button>
        </div>

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
          {isLoading ? <LoadingSpinner size="sm" /> : "Request OTP"}
        </button>

        <div className="text-center mt-4">
          <span className="text-slate-500 text-sm">Don't have an account? </span>
          <Link href="/signup" className="text-[#0D9488] font-semibold text-sm hover:underline">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
