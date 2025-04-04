// src/components/dashboard-header.tsx

"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "../../supabase/client";
import UserProfile from "./user-profile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  created_at: string;
  read: boolean;
}

export default function DashboardHeader() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (!error && data) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        } else {
          console.error("Erro ao buscar notificações:", error);
        }
      }

      setLoading(false);
    };

    fetchData();

    const subscription = supabase
        .channel("notifications-channel")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            (payload) => {
              const newNotification = payload.new as Notification;

              if (newNotification?.user_id === user?.id) {
                setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
                setUnreadCount((prev) => prev + 1);
              }
            }
        )
        .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const supabase = createClient();
    const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user?.id)
        .eq("read", false);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex justify-between items-center">
        <span className="text-xl font-semibold whitespace-nowrap">
          ContractFlow
        </span>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <button
                    type="button"
                    className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="sr-only">Ver notificações</span>
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                      <span className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full top-0 right-0">
                    {unreadCount}
                  </span>
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">Notificações</h3>
                  {unreadCount > 0 && (
                      <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Marcar todas como lidas
                      </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                      <div className="p-4 text-center text-gray-500">Carregando...</div>
                  ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Nenhuma notificação
                      </div>
                  ) : (
                      <ul>
                        {notifications.map((n) => (
                            <li
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                                    !n.read ? "bg-blue-50" : ""
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-sm">{n.title}</p>
                                <span className="text-xs text-gray-500">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {n.message}
                              </p>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 text-center">
                  <a
                      href="/notifications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Ver todas as notificações
                  </a>
                </div>
              </PopoverContent>
            </Popover>

            <UserProfile />
          </div>
        </div>
      </header>
  );
}
