"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users: {
    full_name: string;
    email: string;
  };
}

interface CommentSectionProps {
  contractId: string;
  readOnly?: boolean;
}

export default function CommentSection({
  contractId,
  readOnly = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
    // Get current user info
    const getUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    getUserInfo();
  }, [contractId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/contracts/${contractId}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/contracts/${contractId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      const data = await response.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } catch (err: any) {
      console.error("Error adding comment:", err);
      setError(err.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/contracts/${contractId}/comments?commentId=${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete comment");
      }

      // Remove the deleted comment from state
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      setError(err.message || "Failed to delete comment");
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span>Comentários</span>
          <Badge variant="outline" className="ml-2">
            {comments.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {!readOnly && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user" />
                <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  disabled={isSubmitting}
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Enviar</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhum comentário encontrado</p>
            {!readOnly && (
              <p className="text-sm mt-1">
                Adicione o primeiro comentário acima
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`}
                  />
                  <AvatarFallback className={getAvatarColor(comment.user_id)}>
                    {getInitials(comment.users?.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        {comment.users?.full_name || "Usuário"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">
                      {comment.comment}
                    </div>
                  </div>
                  {!readOnly &&
                    currentUser &&
                    currentUser.id === comment.user_id && (
                      <div className="flex justify-end mt-1">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-gray-500 hover:text-red-500 h-auto py-0 px-1"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              <span>Excluir</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este comentário?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
