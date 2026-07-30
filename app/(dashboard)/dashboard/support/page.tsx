"use client";

import React, { useState } from "react";
import { 
  LifeBuoy, 
  Send, 
  Phone, 
  Mail, 
  ChevronDown, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I verify a customer's drop-off?",
      a: "When a customer arrives, navigate to 'Incoming Parcels', inspect their luggage bags, match the details, and request the OTP. Once they provide the OTP, enter it in the input to lock the booking in the vault."
    },
    {
      q: "A customer lost their secure collection PIN, what do I do?",
      a: "If a customer doesn't have their OTP, ask them to check their Holdit registered mobile app or email. If they still cannot find it, instruct them to contact global customer support to verify identity and trigger a manual OTP re-send."
    },
    {
      q: "How do I update vault storage capacity?",
      a: "Only store owners can modify the physical capacity parameters. Go to 'Store Management', choose the specific store location, and modify the capacity limit if supported, or contact support to request a limit increase."
    },
    {
      q: "What should I do if a bag is left unclaimed for over 48 hours?",
      a: "For unclaimed items exceeding the booking period, do not release them to anyone without official support clearance. File a report using the support desk below, mentioning the booking code."
    }
  ];

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Partner Helpdesk</h1>
        <p className="text-slate-500 font-medium mt-1">Get immediate answers or file direct support queries with our global operations team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns - FAQS & Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={22} className="text-[#0D9488]" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Common Operations FAQ</h3>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index} 
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-700 hover:bg-slate-50/50 transition-colors text-sm"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#0D9488]" : ""}`} 
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-medium border-t border-slate-50 leading-relaxed bg-slate-50/20">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inquiry form */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <LifeBuoy size={22} className="text-indigo-600" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Open Support Ticket</h3>
            </div>

            {submitted && (
              <div className="p-4 mb-6 bg-teal-50 border border-teal-100 text-teal-700 text-sm font-bold rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-300">
                <CheckCircle2 size={18} />
                <span>Support query logged successfully! Ticket ID #HD-{Math.floor(Math.random() * 90000 + 10000)}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSupport} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OTP validation server delay"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-bold text-slate-700 placeholder-slate-350"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Explain Query Detail</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide booking codes or specific details to expedite resolution..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-medium text-slate-700 placeholder-slate-350"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !subject || !message}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0D9488] hover:bg-[#0b7d73] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#0D9488]/10 disabled:opacity-50"
              >
                <Send size={16} />
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Direct Contacts */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit space-y-8">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Direct Channels</h3>
            <p className="text-slate-400 text-xs font-medium mt-1">Immediate reach during operational hours.</p>
          </div>

          <div className="space-y-6">
            {/* <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-655 flex items-center justify-center flex-shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Partner Toll-Free</p>
                <p className="font-black text-slate-700 text-sm mt-0.5">1800-419-8977</p>
                <p className="text-[10px] text-slate-400 font-medium">Available Mon-Sun, 8 AM - 10 PM</p>
              </div>
            </div> */}

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-655 flex items-center justify-center flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helpdesk Email</p>
                <p className="font-black text-slate-700 text-sm mt-0.5">support@holdit.com</p>
                <p className="text-[10px] text-slate-400 font-medium">Typical response time within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
              <Sparkles size={14} className="text-amber-500" />
              <span>SLA Guarantee</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-normal">
              Holdit Premium partner tier bookings receive priority support ticket dispatching. All vault issues resolved under 60 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
