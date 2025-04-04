"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Download,
  FileText,
  Lock,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";
import FormMessage from "@/components/form-message";

type VaultDocument = {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string | null;
  is_critical: boolean;
  created_at: string;
};

type UserPlan = {
  vault_storage_limit: number;
};

export default function VaultDocuments() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<VaultDocument | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);

  // Form states
  const [newDocumentName, setNewDocumentName] = useState("");
  const [newDocumentDescription, setNewDocumentDescription] = useState("");
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [newDocumentIsCritical, setNewDocumentIsCritical] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    fetchDocuments();
    fetchUserPlan();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vault_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);

      // Calculate total storage used
      const totalSize =
        data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;
      setStorageUsed(totalSize);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's plan
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("plan_id")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      if (userData?.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from("plans")
          .select("vault_storage_limit")
          .eq("id", userData.plan_id)
          .single();

        if (planError) throw planError;
        setUserPlan(planData);
      } else {
        // Default plan limits if no plan is assigned
        setUserPlan({ vault_storage_limit: 104857600 }); // 100MB
      }
    } catch (error: any) {
      console.error("Error fetching user plan:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewDocumentFile(e.target.files[0]);
    }
  };

  const handleAddDocument = async () => {
    try {
      setError(null);
      setSuccess(null);
      setUploadProgress(0);

      if (!newDocumentName || !newDocumentFile) {
        setError("Nome do documento e arquivo são obrigatórios");
        return;
      }

      // Check file size against remaining storage
      const remainingStorage =
        (userPlan?.vault_storage_limit || 104857600) - storageUsed;
      if (newDocumentFile.size > remainingStorage) {
        setError(
          "Espaço de armazenamento insuficiente. Atualize seu plano para obter mais espaço.",
        );
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = newDocumentFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `vault/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("vault")
        .upload(filePath, newDocumentFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("vault").getPublicUrl(filePath);

      // Create document record in database
      const { error: insertError } = await supabase
        .from("vault_documents")
        .insert({
          name: newDocumentName,
          description: newDocumentDescription || null,
          file_path: filePath,
          file_url: publicUrl,
          file_size: newDocumentFile.size,
          file_type: newDocumentFile.type,
          is_critical: newDocumentIsCritical,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Update user's storage usage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("users")
          .update({
            vault_storage_used: storageUsed + newDocumentFile.size,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      setSuccess("Documento adicionado com sucesso");
      setIsAddDialogOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error: any) {
      setError(error.message);
      console.error("Error adding document:", error);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!selectedDocument) return;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from("vault")
        .remove([selectedDocument.file_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: deleteError } = await supabase
        .from("vault_documents")
        .delete()
        .eq("id", selectedDocument.id);

      if (deleteError) throw deleteError;

      // Update user's storage usage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("users")
          .update({
            vault_storage_used: Math.max(
              0,
              storageUsed - selectedDocument.file_size,
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }

      setSuccess("Documento excluído com sucesso");
      setIsDeleteDialogOpen(false);
      fetchDocuments();
    } catch (error: any) {
      setError(error.message);
      console.error("Error deleting document:", error);
    }
  };

  const openDeleteDialog = (document: VaultDocument) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setNewDocumentName("");
    setNewDocumentDescription("");
    setNewDocumentFile(null);
    setNewDocumentIsCritical(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  const getStoragePercentage = () => {
    if (!userPlan) return 0;
    return Math.min(100, (storageUsed / userPlan.vault_storage_limit) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando documentos...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && <FormMessage type="error" message={error} className="mb-4" />}
      {success && (
        <FormMessage type="success" message={success} className="mb-4" />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cofre de Documentos</CardTitle>
            <CardDescription>
              Armazene documentos importantes com segurança
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-2"
                disabled={!userPlan || getStoragePercentage() >= 100}
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Documento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Documento</DialogTitle>
                <DialogDescription>
                  Faça upload de documentos importantes para o cofre seguro
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="documentName">Nome do Documento *</Label>
                  <Input
                    id="documentName"
                    placeholder="Nome do documento"
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentDescription">Descrição</Label>
                  <Textarea
                    id="documentDescription"
                    placeholder="Descrição do documento"
                    value={newDocumentDescription}
                    onChange={(e) => setNewDocumentDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentFile">Arquivo *</Label>
                  <Input
                    id="documentFile"
                    type="file"
                    onChange={handleFileChange}
                  />
                  {newDocumentFile && (
                    <p className="text-sm text-gray-500">
                      Tamanho: {formatFileSize(newDocumentFile.size)}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="documentIsCritical"
                    checked={newDocumentIsCritical}
                    onCheckedChange={(checked) =>
                      setNewDocumentIsCritical(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="documentIsCritical"
                    className="flex items-center gap-1"
                  >
                    <Shield className="h-4 w-4 text-amber-500" />
                    Documento Crítico (proteção adicional)
                  </Label>
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Label>Progresso do Upload</Label>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-gray-500 text-right">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddDocument}>Adicionar Documento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Uso de Armazenamento</h3>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">
                Utilizado: {formatFileSize(storageUsed)}
              </span>
              <span className="text-sm">
                Limite: {formatFileSize(userPlan?.vault_storage_limit || 0)}
              </span>
            </div>
            <Progress value={getStoragePercentage()} className="h-2" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-gray-500"
                  >
                    Nenhum documento encontrado no cofre
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      {document.name}
                    </TableCell>
                    <TableCell>
                      {document.file_type || "Desconhecido"}
                    </TableCell>
                    <TableCell>{formatFileSize(document.file_size)}</TableCell>
                    <TableCell>
                      {document.is_critical ? (
                        <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <Lock className="h-3 w-3" />
                          Crítico
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 w-fit">
                          Seguro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(document.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(document.file_url, "_blank")
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(document)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Document Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Documento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedDocument && (
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong> {selectedDocument.name}
                </p>
                {selectedDocument.description && (
                  <p>
                    <strong>Descrição:</strong> {selectedDocument.description}
                  </p>
                )}
                <p>
                  <strong>Tamanho:</strong>{" "}
                  {formatFileSize(selectedDocument.file_size)}
                </p>
                {selectedDocument.is_critical && (
                  <div className="flex items-center gap-2 text-amber-600 mt-2">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">Este é um documento crítico</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              Excluir Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
