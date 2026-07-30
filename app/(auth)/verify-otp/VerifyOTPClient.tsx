"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../../components/auth/AuthLayout";
import { useToast } from "../../../hooks/useToast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { authApi } from "../../../services/authApi";

export default function VerifyOTPClient() {
  const router = useRouter();
  const toast = useToast();
  
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [authFlow, setAuthFlow] = useState<string>("login");
  const [authRole, setAuthRole] = useState<"store" | "store_owner" | "">("");
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if mobile number is in session storage, otherwise redirect
    const storedMobile = sessionStorage.getItem("auth_mobile");
    const storedFlow = sessionStorage.getItem("auth_flow");
    const storedRole = sessionStorage.getItem("auth_role") as "store" | "store_owner";
    
    if (!storedMobile) {
      router.push("/login");
      return;
    }
    
    setMobileNumber(storedMobile);
    if (storedFlow) setAuthFlow(storedFlow);
    if (storedRole) setAuthRole(storedRole);

    // Initialize or restore resend timer based on timestamp
    const storedExpiry = sessionStorage.getItem("otp_timer_expiry");
    const now = Date.now();
    if (storedExpiry) {
      const remainingSeconds = Math.max(0, Math.ceil((parseInt(storedExpiry, 10) - now) / 1000));
      setResendTimer(remainingSeconds);
      if (remainingSeconds === 0) {
        sessionStorage.removeItem("otp_timer_expiry");
      }
    } else {
      const newExpiry = now + 30000;
      sessionStorage.setItem("otp_timer_expiry", newExpiry.toString());
      setResendTimer(30);
    }

    // Initial focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        const storedExpiry = sessionStorage.getItem("otp_timer_expiry");
        if (storedExpiry) {
          const remaining = Math.max(0, Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000));
          setResendTimer(remaining);
          if (remaining === 0) {
            sessionStorage.removeItem("otp_timer_expiry");
          }
        } else {
          setResendTimer((prev) => {
            if (prev <= 1) {
              sessionStorage.removeItem("otp_timer_expiry");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerify = async (code: string) => {
    if (code.length !== 4) return;
    
    setIsLoading(true);
    try {
      if (authRole === "store_owner") {
        await authApi.ownerVerifyOTP(mobileNumber, code);
      } else {
        await authApi.storeVerifyOTP(mobileNumber, code);
      }
      
      toast.success("OTP Verified Successfully!");
      
      // Clear OTP timer and mark as verified in frontend session
      sessionStorage.removeItem("otp_timer_expiry");
      sessionStorage.setItem("auth_verified", "true");
      
      if (authFlow === "signup") {
        router.push("/complete-profile");
      } else {
        router.push("/dashboard"); 
      }
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(errorMsg);
      setOtp(["", "", "", ""]);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take just the last character if multiple are entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input if there's a value
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 4 digits are filled
    const otpString = newOtp.join("");
    if (otpString.length === 4) {
      handleVerify(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move back to previous input and clear it if current is empty
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 4);
    
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 4) newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 3);
      inputRefs.current[nextIndex]?.focus();
      
      if (pastedData.length === 4) {
        handleVerify(pastedData);
      }
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      if (authRole === "store_owner") {
        await authApi.ownerResendOTP(mobileNumber);
      } else {
        await authApi.storeResendOTP(mobileNumber);
      }
      const newExpiry = Date.now() + 30000;
      sessionStorage.setItem("otp_timer_expiry", newExpiry.toString());
      setResendTimer(30);
      toast.success("OTP Resent!");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const maskNumber = (num: string) => {
    if (num.length < 10) return num;
    return `+91 ${num.slice(0, 3)} *** **${num.slice(-2)}`;
  };

  return (
    <AuthLayout 
      title="Verify Account" 
      subtitle={`Enter the 4-digit code sent to ${maskNumber(mobileNumber)}`}
    >
      <div className="mt-8">
        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="w-16 h-16 text-center text-2xl font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition-all bg-slate-50 disabled:opacity-50"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify(otp.join(""))}
          disabled={isLoading || otp.join("").length < 4}
          className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold rounded-xl flex items-center justify-center transition-all disabled:opacity-70 mt-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : "Verify OTP"}
        </button>

        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isLoading}
            className={`text-sm font-semibold transition-colors ${resendTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-[#0D9488] hover:underline"}`}
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
