import { Tables } from "@/types/supabase";

export type CalendarEvent = Tables<"calendar_events"> & {
  attendees?: {
    id: string;
    name: string;
    email: string;
    status: "pending" | "accepted" | "declined";
  }[];
};

export const eventColors = {
  signature: "#10b981", // Green
  renewal: "#f59e0b", // Amber
  payment: "#3b82f6", // Blue
  deadline: "#ef4444", // Red
  custom: "#8b5cf6", // Purple
};

export const getEventTypeLabel = (type: string) => {
  switch (type) {
    case "signature":
      return "Assinatura";
    case "renewal":
      return "Renovação";
    case "payment":
      return "Pagamento";
    case "deadline":
      return "Prazo";
    case "custom":
      return "Personalizado";
    default:
      return type;
  }
};

export const formatDate = (dateString: string, includeTime = false) => {
  const date = new Date(dateString);
  if (includeTime) {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("pt-BR");
};

export const formatCurrency = (value: number, currency = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
};
