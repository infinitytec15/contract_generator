"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_from_admin: boolean;
  created_at: string;
  users: {
    email: string;
    full_name: string | null;
  };
}

interface TicketTimelineProps {
  ticketId: string;
}

export default function TicketTimeline({ ticketId }: TicketTimelineProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();

    // Set up realtime subscription for messages
    const supabase = createClient();
    const subscription = supabase
      .channel(`ticket-${ticketId}-messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          // Fetch the complete message with user data
          fetchMessages();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ticketId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(
        "Não foi possível carregar as mensagens. Por favor, tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      setNewMessage("");
      // The message will be added via the realtime subscription
    } catch (err) {
      console.error("Error sending message:", err);
      setError(
        "Não foi possível enviar a mensagem. Por favor, tente novamente.",
      );
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Histórico do Ticket</h2>

      {error && (
        <div className="p-3 mb-4 rounded bg-red-100 text-red-700">{error}</div>
      )}

      <div className="space-y-6 mb-6">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma mensagem neste ticket ainda.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_from_admin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${msg.is_from_admin ? "bg-gray-100" : "bg-blue-50"}`}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.is_from_admin ? "bg-blue-600" : "bg-gray-600"} text-white mr-2`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {msg.users?.full_name || msg.users?.email || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
        </div>
        <Button
          type="submit"
          className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          disabled={sending || !newMessage.trim()}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Enviar Mensagem
        </Button>
      </form>
    </div>
  );
}
