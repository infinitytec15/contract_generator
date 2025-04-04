"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HistoryEntry {
  id: string;
  action: string;
  actionDescription: string;
  details: any;
  ip_address: string;
  created_at: string;
  user_id: string;
  users: {
    full_name: string;
    email: string;
  };
}

interface ModificationHistoryProps {
  contractId: string;
}

export default function ModificationHistory({
  contractId,
}: ModificationHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10,
    pages: 1,
  });

  // Fetch history on component mount and when page changes
  useEffect(() => {
    fetchHistory(pagination.page);
  }, [contractId, pagination.page]);

  const fetchHistory = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/contracts/${contractId}/history?page=${page}&pageSize=${pagination.pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data.history || []);
      setPagination(data.pagination || pagination);
    } catch (err: any) {
      console.error("Error fetching history:", err);
      setError(err.message || "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date
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

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to get avatar color based on user id
  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index =
      userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  // Helper function to get icon based on action
  const getActionIcon = (action: string) => {
    switch (action) {
      case "contract_created":
        return <History className="h-4 w-4 text-green-600" />;
      case "contract_updated":
        return <History className="h-4 w-4 text-blue-600" />;
      case "contract_signed":
        return <History className="h-4 w-4 text-purple-600" />;
      case "attachment_added":
        return <History className="h-4 w-4 text-orange-600" />;
      case "attachment_deleted":
        return <History className="h-4 w-4 text-red-600" />;
      case "comment_added":
        return <History className="h-4 w-4 text-teal-600" />;
      case "comment_deleted":
        return <History className="h-4 w-4 text-pink-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Histórico de Modificações</span>
          <Badge variant="outline" className="ml-2">
            {pagination.total}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhum registro de histórico encontrado</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <ul className="space-y-6 relative">
                {history.map((entry) => (
                  <li key={entry.id} className="ml-8 relative">
                    <div className="absolute -left-10 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 border border-blue-200">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user_id}`}
                            />
                            <AvatarFallback
                              className={getAvatarColor(entry.user_id)}
                            >
                              {getInitials(entry.users?.full_name || "User")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm">
                              {entry.users?.full_name || "Usuário"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {entry.actionDescription}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      {entry.details &&
                        Object.keys(entry.details).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {Object.entries(entry.details).map(
                              ([key, value]) => (
                                <div key={key} className="flex">
                                  <span className="font-medium mr-1">
                                    {key.replace(/_/g, " ")}:
                                  </span>
                                  <span>
                                    {typeof value === "object"
                                      ? JSON.stringify(value)
                                      : String(value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      {entry.ip_address && (
                        <div className="mt-1 text-xs text-gray-400">
                          IP: {entry.ip_address}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-6 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
