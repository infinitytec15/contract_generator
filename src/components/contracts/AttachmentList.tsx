"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  File,
  FileImage,
  FileSpreadsheet,
  FilePdf,
  FileArchive,
} from "lucide-react";
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

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description: string | null;
  created_at: string;
  uploaded_by: string;
  users: {
    full_name: string;
  };
}

interface AttachmentListProps {
  contractId: string;
  readOnly?: boolean;
}

export default function AttachmentList({
  contractId,
  readOnly = false,
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch attachments on component mount
  useState(() => {
    fetchAttachments();
  });

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/contracts/${contractId}/attachments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch attachments");
      }

      const data = await response.json();
      setAttachments(data.attachments || []);
    } catch (err: any) {
      console.error("Error fetching attachments:", err);
      setError(err.message || "Failed to load attachments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (formData: FormData) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await fetch(`/api/contracts/${contractId}/attachments`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload attachment");
      }

      const data = await response.json();
      setAttachments((prev) => [data.attachment, ...prev]);

      // Reset form and state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

      return true;
    } catch (err: any) {
      console.error("Error uploading attachment:", err);
      setError(err.message || "Failed to upload attachment");
      setIsUploading(false);
      return false;
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const response = await fetch(
        `/api/contracts/${contractId}/attachments?attachmentId=${attachmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete attachment");
      }

      // Remove the deleted attachment from state
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== attachmentId),
      );
    } catch (err: any) {
      console.error("Error deleting attachment:", err);
      setError(err.message || "Failed to delete attachment");
    }
  };

  // Helper function to get appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image/")) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes("pdf")) {
      return <FilePdf className="h-6 w-6 text-red-500" />;
    } else if (
      fileType.includes("spreadsheet") ||
      fileType.includes("excel") ||
      fileType.includes("csv")
    ) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes("zip") || fileType.includes("compressed")) {
      return <FileArchive className="h-6 w-6 text-orange-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Anexos e Documentos</span>
          <Badge variant="outline" className="ml-2">
            {attachments.length}
          </Badge>
        </CardTitle>

        {!readOnly && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Anexo</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpload(formData).then((success) => {
                    if (success) {
                      // Close dialog on success
                      const closeButton = document.querySelector(
                        "[data-dialog-close]",
                      ) as HTMLButtonElement;
                      if (closeButton) closeButton.click();
                    }
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    required
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva o propósito deste anexo..."
                    rows={3}
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      Enviando... {Math.round(uploadProgress)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading}
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        <span>Enviar</span>
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Nenhum anexo encontrado</p>
            {!readOnly && (
              <p className="text-sm mt-1">
                Clique em "Adicionar" para anexar documentos
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="mr-3">{getFileIcon(attachment.file_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">
                      {attachment.file_name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)}
                    </span>
                  </div>
                  {attachment.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {attachment.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>
                      Adicionado por {attachment.users?.full_name || "Usuário"}
                    </span>
                    <span className="mx-1">•</span>
                    <span>
                      {new Date(attachment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(attachment.file_url, "_blank")}
                    title="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {!readOnly && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o anexo "
                            {attachment.file_name}"? Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(attachment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
