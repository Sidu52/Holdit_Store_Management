"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Bot,
  Headphones,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useTickets } from "../../hooks/useSupport";
import LoadingSpinner from "../common/LoadingSpinner";
import type {
  TicketListItem,
  TicketStatus,
  ChatType,
  TicketFilters,
} from "../../types/support";

interface TicketListProps {
  onBack: () => void;
  onOpenTicket: (ticketId: string) => void;
}

const STATUS_OPTIONS: { value: TicketStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "awaiting_user", label: "Awaiting You" },
  { value: "awaiting_admin", label: "Awaiting Admin" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CHAT_TYPE_OPTIONS: { value: ChatType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "BOT_CHAT", label: "Bot Chat" },
  { value: "LIVE_CHAT", label: "Live Chat" },
  { value: "TICKET", label: "Ticket" },
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-600",
  in_progress: "bg-blue-50 text-blue-600",
  pending: "bg-amber-50 text-amber-600",
  awaiting_user: "bg-violet-50 text-violet-600",
  awaiting_admin: "bg-orange-50 text-orange-600",
  resolved: "bg-teal-50 text-teal-600",
  closed: "bg-slate-100 text-slate-500",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-blue-50 text-blue-500",
  high: "bg-amber-50 text-amber-600",
  urgent: "bg-rose-50 text-rose-600",
};

const CHAT_ICONS: Record<string, React.ReactNode> = {
  BOT_CHAT: <Bot size={16} className="text-[#0D9488]" />,
  LIVE_CHAT: <Headphones size={16} className="text-indigo-500" />,
  TICKET: <MessageSquare size={16} className="text-amber-500" />,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketList({ onBack, onOpenTicket }: TicketListProps) {
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    status: "",
    chatType: "",
  });

  const { tickets, pagination, isLoading } = useTickets(filters);

  const updateFilter = (key: keyof TicketFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            All Conversations
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {pagination
              ? `${pagination.totalRecords} total conversations`
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Filter size={16} className="text-slate-400" />
        <select
          value={filters.status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-[#0D9488] transition-all"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filters.chatType}
          onChange={(e) => updateFilter("chatType", e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-[#0D9488] transition-all"
        >
          {CHAT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" className="text-[#0D9488]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100">
          <Inbox size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-bold text-slate-400">
            No conversations found
          </p>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Try adjusting your filters or start a new conversation
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: TicketListItem) => (
            <button
              key={ticket._id}
              onClick={() => onOpenTicket(ticket._id)}
              className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Chat type icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {CHAT_ICONS[ticket.chatType]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {ticket.subject}
                      </p>
                      {ticket.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#0D9488] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {ticket.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[ticket.status] || STATUS_STYLES.open
                        }`}
                      >
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          PRIORITY_STYLES[ticket.priority] || ""
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {ticket.ticketCode}
                      </span>
                      {ticket.isEscalatedToLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          Escalated
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time + last sender */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-400 font-medium">
                    {formatDate(ticket.lastMessageAt || ticket.createdAt)}
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5">
                    by {ticket.lastMessageBy}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page || 1) - 1,
              }))
            }
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: (prev.page || 1) + 1,
              }))
            }
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
