"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Bot,
  Plus,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
  LifeBuoy,
  Headphones,
} from "lucide-react";
import { useFaqs, useTickets } from "../../hooks/useSupport";
import LoadingSpinner from "../common/LoadingSpinner";
import type { TicketListItem, ChatType } from "../../types/support";

interface SupportHubProps {
  onOpenCreateModal: (chatType?: ChatType) => void;
  onOpenTicket: (ticketId: string) => void;
  onViewAllTickets: () => void;
}

// Status badge config
const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-600",
  in_progress: "bg-blue-50 text-blue-600",
  pending: "bg-amber-50 text-amber-600",
  awaiting_user: "bg-violet-50 text-violet-600",
  awaiting_admin: "bg-orange-50 text-orange-600",
  resolved: "bg-teal-50 text-teal-600",
  closed: "bg-slate-100 text-slate-500",
};

const CHAT_TYPE_ICONS: Record<string, React.ReactNode> = {
  BOT_CHAT: <Bot size={14} />,
  LIVE_CHAT: <Headphones size={14} />,
  TICKET: <MessageSquare size={14} />,
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SupportHub({
  onOpenCreateModal,
  onOpenTicket,
  onViewAllTickets,
}: SupportHubProps) {
  const { faqs, isLoading: faqsLoading } = useFaqs();
  const { tickets, isLoading: ticketsLoading } = useTickets({ page: 1, limit: 5 });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Support Center
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Get instant bot assistance, start a live chat, or raise a support ticket.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onOpenCreateModal("BOT_CHAT")}
          className="group relative p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0D9488]/30 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0D9488]/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-xl bg-[#0D9488]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Bot size={24} className="text-[#0D9488]" />
          </div>
          <h3 className="text-sm font-black text-slate-800">Start Instant Chat</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Interact with our assistant & transfer to a live agent anytime
          </p>
        </button>

        <button
          onClick={() => onOpenCreateModal("TICKET")}
          className="group relative p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LifeBuoy size={24} className="text-amber-500" />
          </div>
          <h3 className="text-sm font-black text-slate-800">Raise Ticket</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Submit a detailed support inquiry for complex issues
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — FAQs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={22} className="text-[#0D9488]" />
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                FAQ Suggestions
              </h3>
            </div>

            {faqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="md" className="text-[#0D9488]" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-10">
                <HelpCircle
                  size={40}
                  className="mx-auto text-slate-200 mb-3"
                />
                <p className="text-sm text-slate-400 font-medium">
                  No FAQs available right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq: any, index: number) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() =>
                          setOpenFaqIndex(isOpen ? null : index)
                        }
                        className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-700 hover:bg-slate-50/50 transition-colors text-sm"
                      >
                        <span className="pr-4">{faq.topic}</span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                            isOpen
                              ? "rotate-180 text-[#0D9488]"
                              : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-medium border-t border-slate-50 leading-relaxed bg-slate-50/20">
                          {faq.fullAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — Recent Tickets */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-fit space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-800">
                Recent Conversations
              </h3>
            </div>
            <button
              onClick={onViewAllTickets}
              className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {ticketsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" className="text-slate-400" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare
                size={32}
                className="mx-auto text-slate-200 mb-2"
              />
              <p className="text-xs text-slate-400 font-medium">
                No conversations yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket: TicketListItem) => (
                <button
                  key={ticket._id}
                  onClick={() => onOpenTicket(ticket._id)}
                  className="w-full p-3.5 rounded-xl border border-slate-50 hover:border-slate-200 hover:bg-slate-50/50 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 flex-shrink-0">
                        {CHAT_TYPE_ICONS[ticket.chatType]}
                      </span>
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {ticket.subject}
                      </p>
                    </div>
                    {ticket.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#0D9488] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {ticket.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[ticket.status] || STATUS_STYLES.open
                      }`}
                    >
                      {ticket.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">
                      {formatTimeAgo(ticket.lastMessageAt || ticket.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* SLA Note */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
              <Sparkles size={14} className="text-amber-500" />
              <span>SLA Guarantee</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-normal">
              Premium partner tier bookings receive priority support dispatching.
              All vault issues resolved under 60 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
