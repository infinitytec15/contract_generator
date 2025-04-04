"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
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
}

interface DocumentDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: VaultDocument | null;
  onDelete: () => Promise<void>;
}

export default function DocumentDeleteDialog({
  isOpen,
  onOpenChange,
  document,
  onDelete,
}: DocumentDeleteDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Documento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este documento? Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <p>
              <strong>Nome:</strong> {document.name}
            </p>
            {document.description && (
              <p>
                <strong>Descrição:</strong> {document.description}
              </p>
            )}
            <p>
              <strong>Tamanho:</strong> {formatFileSize(document.file_size)}
            </p>
            {document.is_critical && (
              <div className="flex items-center gap-2 text-amber-600 mt-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Este é um documento crítico</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Excluir Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
