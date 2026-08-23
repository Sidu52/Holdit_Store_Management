"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Headphones,
  Bot,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useTicketDetail } from "../../hooks/useSupport";
import { supportApi } from "../../services/supportApi";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { socket, joinSupportRoom, leaveSupportRoom, sendSupportTyping } from "../../lib/socket";
import LoadingSpinner from "../common/LoadingSpinner";
import type { TicketMessage, ChatType, TicketStatus } from "../../types/support";

interface ChatThreadProps {
  ticketId: string;
  onBack: () => void;
}

function formatMessageTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatThread({ ticketId, onBack }: ChatThreadProps) {
  const { role, user } = useAuth();
  const toast = useToast();
  const { ticket, isLoading, mutate } = useTicketDetail(ticketId);

  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingRole, setTypingRole] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages, isTyping]);

  // Real-time Socket.IO listeners
  useEffect(() => {
    if (!ticketId) return;

    // Join room emit event: support:join_room
    joinSupportRoom(ticketId);

    const handleNewMessage = (data: { ticketId: string; message: TicketMessage; status?: TicketStatus }) => {
      if (data.ticketId === ticketId) {
        mutate((currentData: any) => {
          if (!currentData?.data) return currentData;
          const existingMsgs: TicketMessage[] = currentData.data.messages || [];

          // Check if exact _id already exists
          const exactExists = existingMsgs.some((m) => m._id === data.message._id);
          if (exactExists) return currentData;

          // Check if there is an optimistic temp message with same text & sender
          const tempIndex = existingMsgs.findIndex(
            (m) =>
              m._id.startsWith("user-msg-") &&
              m.message === data.message.message &&
              m.senderModel === data.message.senderModel
          );

          let updatedMsgs = [...existingMsgs];
          if (tempIndex !== -1) {
            updatedMsgs[tempIndex] = data.message;
          } else {
            updatedMsgs.push(data.message);
          }

          return {
            ...currentData,
            data: {
              ...currentData.data,
              messages: updatedMsgs,
              status: data.status || currentData.data.status,
            },
          };
        }, false);
        scrollToBottom();
      }
    };

    const handleTyping = (data: { ticketId: string; isTyping: boolean; role?: string }) => {
      if (data.ticketId === ticketId) {
        setIsTyping(data.isTyping);
        if (data.role) setTypingRole(data.role);
      }
    };

    const handleStatusUpdated = (data: { ticketId: string; status: TicketStatus; chatType?: ChatType }) => {
      if (data.ticketId === ticketId) {
        mutate();
        toast.info(`Ticket status updated to ${data.status.replace(/_/g, " ")}`);
      }
    };

    const handleTicketEscalated = (data: { ticketId: string; chatType?: ChatType; isEscalatedToLive?: boolean }) => {
      if (data.ticketId === ticketId) {
        mutate();
        toast.success("Ticket transferred to Live Agent!");
      }
    };

    socket.on("support:new_message", handleNewMessage);
    socket.on("support:typing", handleTyping);
    socket.on("support:status_updated", handleStatusUpdated);
    socket.on("support:ticket_escalated", handleTicketEscalated);

    return () => {
      leaveSupportRoom(ticketId);
      socket.off("support:new_message", handleNewMessage);
      socket.off("support:typing", handleTyping);
      socket.off("support:status_updated", handleStatusUpdated);
      socket.off("support:ticket_escalated", handleTicketEscalated);
    };
  }, [ticketId, mutate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    sendSupportTyping(ticketId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendSupportTyping(ticketId, false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !role || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await supportApi.sendMessage(role, ticketId, {
        message: messageText,
      });

      // Update local state smoothly via SWR mutate
      mutate((currentData: any) => {
        if (!currentData?.data) return currentData;

        const msgs = [...(currentData.data.messages || [])];

        // 1. Add User Message
        const userMsg: TicketMessage = {
          _id: res.data?.userMessage?._id || `user-msg-${Date.now()}`,
          senderId: user?._id || user?.id || "",
          senderModel: role === "store_owner" ? "StoreOwner" : "Store",
          message: messageText,
          isRead: true,
          createdAt: new Date().toISOString(),
        };

        if (
          !msgs.some(
            (m) =>
              m._id === userMsg._id ||
              (m.message === userMsg.message && m.senderModel === userMsg.senderModel)
          )
        ) {
          msgs.push(userMsg);
        }

        // 2. Add Bot / Admin Reply Message if present in response
        const replyMsg = res.data?.message;
        if (
          replyMsg &&
          replyMsg.message &&
          !msgs.some(
            (m) =>
              m._id === replyMsg._id ||
              (m.message === replyMsg.message && m.senderModel === replyMsg.senderModel)
          )
        ) {
          msgs.push(replyMsg);
        }

        const updatedStatus = res.data?.status || currentData.data.status;
        const updatedChatType = res.data?.chatType || currentData.data.chatType;
        const updatedEscalated =
          res.data?.isEscalatedToLive ?? currentData.data.isEscalatedToLive;

        return {
          ...currentData,
          data: {
            ...currentData.data,
            messages: msgs,
            status: updatedStatus,
            chatType: updatedChatType,
            isEscalatedToLive: updatedEscalated,
          },
        };
      }, false);

      scrollToBottom();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to send message");
      setInputMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleEscalate = async () => {
    if (!role || isEscalating) return;
    setIsEscalating(true);
    try {
      await supportApi.escalateTicket(role, ticketId);
      toast.success("Successfully escalated to Live Support Agent!");
      mutate();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to escalate ticket");
    } finally {
      setIsEscalating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" className="text-[#0D9488]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
        <ShieldAlert size={48} className="mx-auto text-rose-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Ticket Not Found</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl text-slate-600 hover:bg-slate-200"
        >
          Return to Support Center
        </button>
      </div>
    );
  }

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300 max-w-5xl">
      {/* Thread Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-800 truncate">
                {ticket.subject || "Support Request"}
              </h2>
              <span className="text-xs font-mono font-bold text-slate-400">
                {ticket.ticketCode}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488]">
                {ticket.chatType.replace("_", " ")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {ticket.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Escalate button if bot chat or ticket not yet live */}
        {!ticket.isEscalatedToLive && !isClosed && (
          <button
            onClick={handleEscalate}
            disabled={isEscalating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 flex-shrink-0 disabled:opacity-50"
          >
            <Headphones size={15} />
            {isEscalating ? "Transferring..." : "Talk to Live Agent"}
          </button>
        )}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {ticket.messages?.map((msg: TicketMessage, idx: number) => {
          const isMe =
            msg.senderModel === "Store" || msg.senderModel === "StoreOwner";
          const isBot = msg.senderModel === "Bot";

          return (
            <div
              key={msg._id || idx}
              className={`flex items-end gap-2.5 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 text-xs font-bold ${
                    isBot ? "bg-[#0D9488]" : "bg-indigo-600"
                  }`}
                >
                  {isBot ? <Bot size={16} /> : <Headphones size={16} />}
                </div>
              )}

              <div
                className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm shadow-xs ${
                  isMe
                    ? "bg-[#0D9488] text-white rounded-br-none"
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isMe ? "text-teal-100" : "text-slate-400"
                    }`}
                  >
                    {isMe ? "You" : msg.senderModel}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isMe ? "text-teal-100/70" : "text-slate-300"
                    }`}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed font-medium">
                  {msg.message}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium italic">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <span>{typingRole || "Support"} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Closed Footer */}
      {isClosed ? (
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
          <Lock size={16} />
          <span>This support conversation is resolved and closed.</span>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white border-t border-slate-100 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type your message here... (Reply 'AGENT' to speak with live agent)"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/10 text-slate-700 placeholder-slate-400 transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-3 bg-[#0D9488] hover:bg-[#0b7d73] text-white rounded-xl transition-all shadow-md shadow-[#0D9488]/15 disabled:opacity-50 flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
