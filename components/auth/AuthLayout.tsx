import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
   <div className=" flex-1 w-full h-full items-center justify-center bg-[#dff8f0] text-slate-900">
     <div className="flex w-full h-full bg-[#EAFBF6]">
      {/* Left side - Illustration / Branding */}
      <div className="hidden lg:flex w-1/2  p-12 flex-col justify-between relative overflow-hidden">
        <div className="z-10 relative">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-6 h-6 rounded-full bg-[#0D9488]" />
            <span className="font-bold text-xl text-slate-800 tracking-tight">Holdit.</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight max-w-sm text-slate-800">
            Grow with <br />
            <span className="text-[#0D9488]">Holdit</span>
          </h1>
        </div>

        {/* Illustration image created by AI */}
        <div className="relative flex-1 flex items-center justify-center mt-10 z-10 w-full h-full max-h-[600px] ">
          <Image
            src="/team-illustration.png"
            alt="Team Collaboration"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Decorative background circle (optional) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
      </div>

      {/* Right side - Form area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-24 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <div className="w-full">{children}</div>
          
          {/* Footer copyright */}
          <div className="mt-16 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} all rights reserved
          </div>
        </div>
      </div>
    </div>
   </div>
  );
}
