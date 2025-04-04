"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Users,
  Bell,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  contract_id: string;
  title: string;
  description: string | null;
  event_type: "signature" | "renewal" | "payment" | "deadline" | "custom";
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  location: string | null;
  color: string | null;
  reminder_days: number[];
  created_by: string;
  created_at: string;
  updated_at: string;
  attendees?: {
    id: string;
    name: string;
    email: string;
    status: "pending" | "accepted" | "declined";
  }[];
}

interface ContractCalendarProps {
  contractId: string;
  contractName?: string;
}

export default function ContractCalendar({
  contractId,
  contractName = "Contrato",
}: ContractCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "custom",
    start_date: "",
    end_date: "",
    all_day: true,
    location: "",
    color: "#3b82f6", // Default blue
    reminder_days: [1, 7], // Default 1 day and 7 days before
  });

  // Event colors by type
  const eventColors = {
    signature: "#10b981", // Green
    renewal: "#f59e0b", // Amber
    payment: "#3b82f6", // Blue
    deadline: "#ef4444", // Red
    custom: "#8b5cf6", // Purple
  };

  useEffect(() => {
    fetchEvents();
  }, [contractId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // Get events for this contract
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("contract_id", contractId);

      if (error) {
        throw new Error(error.message);
      }

      // Get attendees for each event
      const eventsWithAttendees = await Promise.all(
        (data || []).map(async (event) => {
          const { data: attendees, error: attendeesError } = await supabase
            .from("event_attendees")
            .select("id, name, email, status")
            .eq("event_id", event.id);

          if (attendeesError) {
            console.error("Error fetching attendees:", attendeesError);
            return event;
          }

          return { ...event, attendees: attendees || [] };
        }),
      );

      setEvents(eventsWithAttendees);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message || "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, let's create some mock events if none exist
  useEffect(() => {
    if (!loading && events.length === 0 && !error) {
      // Create mock events
      const today = new Date();
      const mockEvents: Partial<CalendarEvent>[] = [
        {
          title: "Assinatura do Contrato",
          description: "Data limite para assinatura do contrato",
          event_type: "signature",
          start_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 5,
          ).toISOString(),
          all_day: true,
          color: eventColors.signature,
          reminder_days: [1, 3],
        },
        {
          title: "Renovação Automática",
          description: "Data de renovação automática do contrato",
          event_type: "renewal",
          start_date: new Date(
            today.getFullYear(),
            today.getMonth() + 11,
            today.getDate(),
          ).toISOString(),
          all_day: true,
          color: eventColors.renewal,
          reminder_days: [30, 15, 7],
        },
        {
          title: "Pagamento Mensal",
          description: "Pagamento mensal do contrato",
          event_type: "payment",
          start_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            10,
          ).toISOString(),
          all_day: true,
          color: eventColors.payment,
          reminder_days: [3, 1],
        },
        {
          title: "Prazo para Revisão",
          description: "Prazo final para revisão dos termos",
          event_type: "deadline",
          start_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 15,
          ).toISOString(),
          all_day: true,
          color: eventColors.deadline,
          reminder_days: [7, 3, 1],
        },
        {
          title: "Reunião de Alinhamento",
          description: "Reunião para alinhamento de expectativas",
          event_type: "custom",
          start_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 2,
            14,
            0,
          ).toISOString(),
          end_date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 2,
            15,
            30,
          ).toISOString(),
          all_day: false,
          location: "Sala de Reuniões 3",
          color: eventColors.custom,
          reminder_days: [1],
        },
      ];

      // Set mock events to state
      setEvents(mockEvents as CalendarEvent[]);
    }
  }, [loading, events, error]);

  const handleAddEvent = async () => {
    try {
      // Validate form
      if (!newEvent.title || !newEvent.start_date) {
        alert("Título e data de início são obrigatórios");
        return;
      }

      const supabase = createClient();

      // Insert event
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          contract_id: contractId,
          title: newEvent.title,
          description: newEvent.description || null,
          event_type: newEvent.event_type,
          start_date: newEvent.start_date,
          end_date: newEvent.end_date || null,
          all_day: newEvent.all_day,
          location: newEvent.location || null,
          color: newEvent.color,
          reminder_days: newEvent.reminder_days,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Add to events list
      setEvents([...events, data as CalendarEvent]);

      // Reset form and close dialog
      setNewEvent({
        title: "",
        description: "",
        event_type: "custom",
        start_date: "",
        end_date: "",
        all_day: true,
        location: "",
        color: "#3b82f6",
        reminder_days: [1, 7],
      });
      setShowAddEventDialog(false);
    } catch (err: any) {
      console.error("Error adding event:", err);
      alert(`Erro ao adicionar evento: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
      const supabase = createClient();

      // Delete event
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) {
        throw new Error(error.message);
      }

      // Remove from events list
      setEvents(events.filter((event) => event.id !== eventId));
      setSelectedEvent(null);
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert(`Erro ao excluir evento: ${err.message}`);
    }
  };

  const syncWithExternalCalendar = async () => {
    alert(
      "Funcionalidade de sincronização com calendários externos será implementada em breve.",
    );
  };

  // Helper function to format date
  const formatDate = (dateString: string, includeTime = false) => {
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

  // Helper function to get event type label
  const getEventTypeLabel = (type: string) => {
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

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Render day contents with event indicators
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    return (
      <div className="relative w-full h-full">
        <div>{day.getDate()}</div>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: event.color || eventColors[event.event_type],
                }}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <span>Calendário de Eventos</span>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithExternalCalendar}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sincronizar</span>
          </Button>
          <Dialog
            open={showAddEventDialog}
            onOpenChange={setShowAddEventDialog}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Evento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Título do evento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    placeholder="Descrição do evento"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event_type">Tipo de Evento</Label>
                  <Select
                    value={newEvent.event_type}
                    onValueChange={(value) =>
                      setNewEvent({
                        ...newEvent,
                        event_type: value as any,
                        color: eventColors[value as keyof typeof eventColors],
                      })
                    }
                  >
                    <SelectTrigger id="event_type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signature">Assinatura</SelectItem>
                      <SelectItem value="renewal">Renovação</SelectItem>
                      <SelectItem value="payment">Pagamento</SelectItem>
                      <SelectItem value="deadline">Prazo</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={newEvent.start_date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">Data de Término (opcional)</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={newEvent.end_date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, end_date: e.target.value })
                      }
                      disabled={newEvent.all_day}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all_day"
                    checked={newEvent.all_day}
                    onCheckedChange={(checked) =>
                      setNewEvent({ ...newEvent, all_day: checked as boolean })
                    }
                  />
                  <Label htmlFor="all_day">Dia inteiro</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Local (opcional)</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    placeholder="Local do evento"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Lembretes (dias antes)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 7, 15, 30].map((days) => (
                      <Badge
                        key={days}
                        variant={
                          newEvent.reminder_days.includes(days)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          if (newEvent.reminder_days.includes(days)) {
                            setNewEvent({
                              ...newEvent,
                              reminder_days: newEvent.reminder_days.filter(
                                (d) => d !== days,
                              ),
                            });
                          } else {
                            setNewEvent({
                              ...newEvent,
                              reminder_days: [
                                ...newEvent.reminder_days,
                                days,
                              ].sort((a, b) => a - b),
                            });
                          }
                        }}
                      >
                        {days} {days === 1 ? "dia" : "dias"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleAddEvent}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              components={{
                Day: ({ date: day, ...props }) => (
                  <button
                    {...props}
                    className={`${props.className} h-9 w-9 p-0 font-normal aria-selected:opacity-100`}
                    onClick={() => {
                      setDate(day);
                      props.onClick?.(day);
                    }}
                  >
                    {renderDay(day)}
                  </button>
                ),
              }}
            />

            <div className="mt-6">
              <h3 className="font-medium text-lg mb-3">
                Eventos para {date ? date.toLocaleDateString("pt-BR") : "hoje"}
              </h3>
              <div className="space-y-3">
                {date &&
                  getEventsForDate(date).map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              event.color ||
                              eventColors[
                                event.event_type as keyof typeof eventColors
                              ],
                          }}
                        ></div>
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline" className="ml-auto">
                          {getEventTypeLabel(event.event_type)}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {event.all_day
                              ? "Dia inteiro"
                              : `${formatDate(event.start_date, true)}${event.end_date ? ` - ${formatDate(event.end_date, true)}` : ""}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.reminder_days &&
                          event.reminder_days.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              <span>
                                Lembretes: {event.reminder_days.join(", ")} dias
                                antes
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                {date && getEventsForDate(date).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Nenhum evento para esta data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event Details Dialog */}
        {selectedEvent && (
          <Dialog
            open={!!selectedEvent}
            onOpenChange={() => setSelectedEvent(null)}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        selectedEvent.color ||
                        eventColors[
                          selectedEvent.event_type as keyof typeof eventColors
                        ],
                    }}
                  ></div>
                  <span>{selectedEvent.title}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Badge>{getEventTypeLabel(selectedEvent.event_type)}</Badge>
                {selectedEvent.description && (
                  <p className="text-sm">{selectedEvent.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {selectedEvent.all_day
                        ? `${formatDate(selectedEvent.start_date)} (Dia inteiro)`
                        : `${formatDate(selectedEvent.start_date, true)}${selectedEvent.end_date ? ` - ${formatDate(selectedEvent.end_date, true)}` : ""}`}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.reminder_days &&
                    selectedEvent.reminder_days.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bell className="h-4 w-4 text-gray-500" />
                        <span>
                          Lembretes: {selectedEvent.reminder_days.join(", ")}{" "}
                          dias antes
                        </span>
                      </div>
                    )}
                  {selectedEvent.attendees &&
                    selectedEvent.attendees.length > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium mb-1">Participantes:</p>
                          <ul className="space-y-1">
                            {selectedEvent.attendees.map((attendee) => (
                              <li
                                key={attendee.id}
                                className="flex items-center gap-1"
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${attendee.status === "accepted" ? "bg-green-50 text-green-700" : attendee.status === "declined" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"}`}
                                >
                                  {attendee.status === "accepted"
                                    ? "Confirmado"
                                    : attendee.status === "declined"
                                      ? "Recusado"
                                      : "Pendente"}
                                </Badge>
                                <span>
                                  {attendee.name} ({attendee.email})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Fechar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
