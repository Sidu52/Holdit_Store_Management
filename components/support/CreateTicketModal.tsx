"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  Tag,
  AlertTriangle,
  MessageSquare,
  Bot,
  Headphones,
} from "lucide-react";
import { supportApi } from "../../services/supportApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type {
  ChatType,
  TicketCategory,
  TicketPriority,
  CreateTicketPayload,
} from "../../types/support";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ticketId: string) => void;
  defaultChatType?: ChatType;
}

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "store", label: "Store Operations" },
  { value: "booking", label: "Booking" },
  { value: "payment", label: "Payment" },
  { value: "account", label: "Account" },
  { value: "technical", label: "Technical" },
  { value: "earnings", label: "Earnings" },
  { value: "other", label: "Other" },
];

const PRIORITIES: { value: TicketPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-600" },
  { value: "medium", label: "Medium", color: "bg-blue-50 text-blue-600" },
  { value: "high", label: "High", color: "bg-amber-50 text-amber-600" },
  { value: "urgent", label: "Urgent", color: "bg-rose-50 text-rose-600" },
];

const CHAT_TYPES: { value: ChatType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "BOT_CHAT",
    label: "Start Chat",
    icon: <Bot size={18} />,
    desc: "Interactive assistant chat with option to transfer to a live agent",
  },
  {
    value: "TICKET",
    label: "Support Ticket",
    icon: <Tag size={18} />,
    desc: "Submit a detailed ticket for complex issues",
  },
];

export default function CreateTicketModal({
  isOpen,
  onClose,
  onCreated,
  defaultChatType = "BOT_CHAT",
}: CreateTicketModalProps) {
  const { role } = useAuth();
  const toast = useToast();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<TicketCategory>("store");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [chatType, setChatType] = useState<ChatType>(defaultChatType);
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSubject("");
    setCategory("store");
    setPriority("medium");
    setChatType(defaultChatType);
    setMessage("");
    setBookingId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !role) return;

    setIsSubmitting(true);
    try {
      const payload: CreateTicketPayload = {
        subject: subject.trim(),
        category,
        priority,
        chatType,
        message: message.trim(),
      };
      if (bookingId.trim()) {
        payload.bookingId = bookingId.trim();
      }

      const res = await supportApi.createTicket(role, payload);
      const ticketId = res?.data?.ticketId || res?.data?._id;
      toast.success("Ticket created successfully!");
      resetForm();
      onCreated(ticketId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 flex items-center justify-center">
              <MessageSquare size={20} className="text-[#0D9488]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                New Support Request
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Choose how you&apos;d like to get help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Chat Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Support Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CHAT_TYPES.map((ct) => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setChatType(ct.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${
                    chatType === ct.value
                      ? "border-[#0D9488] bg-[#0D9488]/5"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div
                    className={`mx-auto mb-1.5 ${
                      chatType === ct.value
                        ? "text-[#0D9488]"
                        : "text-slate-400"
                    }`}
                  >
                    {ct.icon}
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      chatType === ct.value
                        ? "text-[#0D9488]"
                        : "text-slate-600"
                    }`}
                  >
                    {ct.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. OTP validation issue"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 font-semibold text-slate-700 placeholder-slate-300 transition-all"
            />
          </div>

          {/* Category + Priority Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as TicketCategory)
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-semibold text-slate-700 bg-white transition-all"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                      priority === p.value
                        ? `${p.color} ring-2 ring-offset-1 ring-current/20`
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 font-medium text-slate-700 placeholder-slate-300 transition-all resize-none"
            />
          </div>

          {/* Booking ID (optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Booking ID{" "}
              <span className="text-slate-300 normal-case font-medium">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0D9488] font-medium text-slate-700 placeholder-slate-300 transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !subject.trim() || !message.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0D9488] hover:bg-[#0b7d73] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#0D9488]/15 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {isSubmitting ? "Creating..." : "Create Support Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
