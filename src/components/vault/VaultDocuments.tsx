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
  Calendar,
  Download,
  Eye,
  FileText,
  FolderTree,
  History,
  Lock,
  Plus,
  Search,
  Share2,
  Shield,
  Tag,
  Trash2,
} from "lucide-react";
import FormMessage from "@/components/form-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

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
  document_type?: string;
  tags?: string[];
  extracted_text?: string;
  expiration_date?: string;
  folder_path?: string;
  ocr_processed?: boolean;
  classification_processed?: boolean;
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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isTimelineView, setIsTimelineView] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<VaultDocument | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [folders, setFolders] = useState<string[]>([]);

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
  
  useEffect(() => {
    if (documents.length > 0) {
      // Extract unique folders from documents
      const uniqueFolders = Array.from(
        new Set(
          documents
            .filter((doc) => doc.folder_path)
            .map((doc) => doc.folder_path)
        )
      );
      setFolders(uniqueFolders as string[]);
    }
  }, [documents]);

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
      const { data: insertedDoc, error: insertError } = await supabase
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
        })
        .select()
        .single();

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

      // Process document with OCR and classification
      if (insertedDoc) {
        try {
          // Call the edge function to process the document
          const { error: processError } = await supabase.functions.invoke(
            "process-document",
            {
              body: { documentId: insertedDoc.id },
            }
          );

          if (processError) {
            console.error("Error processing document:", processError);
          }
        } catch (processError) {
          console.error("Error calling document processing:", processError);
          // Continue even if processing fails
        }
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

  const openDetailsDialog = (document: VaultDocument) => {
    setSelectedDocument(document);
    setIsDetailsDialogOpen(true);
    
    // Log document view
    logDocumentAccess(document.id, 'view');
  };
  
  const logDocumentAccess = async (documentId: string, action: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('document_access_logs').insert({
        document_id: documentId,
        user_id: user.id,
        action: action,
        ip_address: 'client-side', // In a real app, you'd get this from the server
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging document access:', error);
    }
  };
  
  const handleDownloadDocument = async (document: VaultDocument) => {
    try {
      // Log document download
      await logDocumentAccess(document.id, 'download');
      
      // Open the document URL in a new tab
      window.open(document.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTimelineView(!isTimelineView)}
              className="flex items-center gap-1"
            >
              {isTimelineView ? (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Visualização em Lista</span>
                </>
              ) : (
                <>
                  <History className="h-4 w-4" />
                  <span>Visualização em Timeline</span>
                </>
              )}
            </Button>
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

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActiveTab("all")}>Todos</TabsTrigger>
              <TabsTrigger value="folders" onClick={() => setActiveTab("folders")}>Pastas</TabsTrigger>
              {folders.length > 0 && folders.slice(0, 3).map((folder, index) => (
                <TabsTrigger 
                  key={index} 
                  value={folder || ""}
                  onClick={() => setActiveTab(folder || "")}
                >
                  {folder?.split('/').pop() || "Sem pasta"}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isTimelineView ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-gray-200 before:content-['']">
              {documents
                .filter(doc => activeTab === "all" || doc.folder_path === activeTab)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((document, index) => (
                  <div key={document.id} className="relative pl-6">
                    <div className="flex items-center">
                      <div className="absolute left-0 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow border border-gray-200">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="grow ml-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{document.name}</h3>
                          <div className="flex items-center gap-1">
                            {document.is_critical && (
                              <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Crítico
                              </Badge>
                            )}
                            {document.document_type && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {document.document_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {document.description || "Sem descrição"}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-sm text-gray-500">
                            {new Date(document.created_at).toLocaleDateString()} às {new Date(document.created_at).toLocaleTimeString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailsDialog(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(document)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(document)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
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
                  documents
                    .filter(doc => activeTab === "all" || doc.folder_path === activeTab)
                    .map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          {document.name}
                          {document.document_type && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800">
                              {document.document_type}
                            </Badge>
                          )}
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
                              onClick={() => openDetailsDialog(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(document)}
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
          )}
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

      {/* Document Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedDocument && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedDocument.name}</DialogTitle>
                  {selectedDocument.document_type && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedDocument.document_type}
                    </Badge>
                  )}
                </div>
                <DialogDescription>
                  Detalhes do documento e informações extraídas
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Informações Básicas</h3>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      {selectedDocument.description && (
                        <p className="text-sm">
                          <span className="font-medium">Descrição:</span> {selectedDocument.description}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Tipo de Arquivo:</span> {selectedDocument.file_type || "Desconhecido"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Tamanho:</span> {formatFileSize(selectedDocument.file_size)}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Data de Upload:</span> {new Date(selectedDocument.created_at).toLocaleDateString()}
                      </p>
                      {selectedDocument.folder_path && (
                        <p className="text-sm flex items-center gap-1">
                          <span className="font-medium">Pasta:</span>
                          <FolderTree className="h-3 w-3 text-gray-500" />
                          {selectedDocument.folder_path}
                        </p>
                      )}
                      {selectedDocument.expiration_date && (
                        <p className="text-sm flex items-center gap-1">
                          <span className="font-medium">Expira em:</span>
                          <Calendar className="h-3 w-3 text-gray-500" />
                          {new Date(selectedDocument.expiration_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedDocument.tags.map((tag, index) => (
                          <Badge key={index} className="bg-gray-100 text-gray-800 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDownloadDocument(selectedDocument)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Documento
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedDocument.extracted_text && (
                    <div>
                      <h3 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Search className="h-4 w-4" />
                        Texto Extraído (OCR)
                      </h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="text-xs whitespace-pre-wrap">{selectedDocument.extracted_text}</pre>
                      </div>
                    </div>
                  )}
                  
                  {selectedDocument.is_critical && (
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Shield className="h-5 w-5" />
                        <h3 className="font-medium">Documento Crítico</h3>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        Este documento está marcado como crítico e possui proteções adicionais.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
