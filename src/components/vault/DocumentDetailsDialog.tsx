"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  FolderTree,
  Search,
  Share2,
  Shield,
  Tag,
} from "lucide-react";
import { formatFileSize } from "@/utils/utils";

interface VaultDocument {
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
}

interface DocumentDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
  onDownload: (document: VaultDocument) => Promise<void>;
}

export default function DocumentDetailsDialog({
  isOpen,
  onOpenChange,
  document,
  onDownload,
}: DocumentDetailsDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{document.name}</DialogTitle>
            {document.document_type && (
              <Badge className="bg-blue-100 text-blue-800">
                {document.document_type}
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
                {document.description && (
                  <p className="text-sm">
                    <span className="font-medium">Descrição:</span>{" "}
                    {document.description}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Tipo de Arquivo:</span>{" "}
                  {document.file_type || "Desconhecido"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Tamanho:</span>{" "}
                  {formatFileSize(document.file_size)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Data de Upload:</span>{" "}
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
                {document.folder_path && (
                  <p className="text-sm flex items-center gap-1">
                    <span className="font-medium">Pasta:</span>
                    <FolderTree className="h-3 w-3 text-gray-500" />
                    {document.folder_path}
                  </p>
                )}
                {document.expiration_date && (
                  <p className="text-sm flex items-center gap-1">
                    <span className="font-medium">Expira em:</span>
                    <Calendar className="h-3 w-3 text-gray-500" />
                    {new Date(document.expiration_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-100 text-gray-800 flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => onDownload(document)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Baixar Documento
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {document.extracted_text && (
              <div>
                <h3 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Texto Extraído (OCR)
                </h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <pre className="text-xs whitespace-pre-wrap">
                    {document.extracted_text}
                  </pre>
                </div>
              </div>
            )}

            {document.is_critical && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex items-center gap-2 text-amber-700">
                  <Shield className="h-5 w-5" />
                  <h3 className="font-medium">Documento Crítico</h3>
                </div>
                <p className="text-sm text-amber-700 mt-1">
                  Este documento está marcado como crítico e possui proteções
                  adicionais.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
