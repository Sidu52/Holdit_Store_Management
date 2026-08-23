"use client";

import React, { useState } from "react";
import SupportHub from "@/components/support/SupportHub";
import TicketList from "@/components/support/TicketList";
import ChatThread from "@/components/support/ChatThread";
import CreateTicketModal from "@/components/support/CreateTicketModal";
import type { ChatType } from "@/types/support";

type ViewState = "hub" | "tickets" | "chat";

export default function SupportPage() {
  const [view, setView] = useState<ViewState>("hub");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultChatType, setModalDefaultChatType] = useState<ChatType>("BOT_CHAT");

  const handleOpenCreateModal = (chatType: ChatType = "BOT_CHAT") => {
    setModalDefaultChatType(chatType);
    setIsModalOpen(true);
  };

  const handleTicketCreated = (ticketId: string) => {
    setIsModalOpen(false);
    setActiveTicketId(ticketId);
    setView("chat");
  };

  const handleOpenTicket = (ticketId: string) => {
    setActiveTicketId(ticketId);
    setView("chat");
  };

  return (
    <>
      {view === "hub" && (
        <SupportHub
          onOpenCreateModal={handleOpenCreateModal}
          onOpenTicket={handleOpenTicket}
          onViewAllTickets={() => setView("tickets")}
        />
      )}

      {view === "tickets" && (
        <TicketList
          onBack={() => setView("hub")}
          onOpenTicket={handleOpenTicket}
        />
      )}

      {view === "chat" && activeTicketId && (
        <ChatThread
          ticketId={activeTicketId}
          onBack={() => setView("hub")}
        />
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTicketCreated}
        defaultChatType={modalDefaultChatType}
      />
    </>
  );
}
