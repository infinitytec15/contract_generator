"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Shield } from "lucide-react";
import { formatFileSize } from "@/utils/utils";

interface DocumentUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (documentData: {
    name: string;
    description: string;
    file: File | null;
    isCritical: boolean;
    expirationDate?: string;
    documentType?: string;
    tags?: string[];
  }) => Promise<void>;
  uploadProgress: number;
}

export default function DocumentUploadDialog({
  isOpen,
  onOpenChange,
  onUpload,
  uploadProgress,
}: DocumentUploadDialogProps) {
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentIsCritical, setDocumentIsCritical] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    await onUpload({
      name: documentName,
      description: documentDescription,
      file: documentFile,
      isCritical: documentIsCritical,
      expirationDate: expirationDate || undefined,
      documentType: documentType || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });

    // Reset form after successful upload
    setDocumentName("");
    setDocumentDescription("");
    setDocumentFile(null);
    setDocumentIsCritical(false);
    setDocumentType("");
    setExpirationDate("");
    setTags([]);
    setTagInput("");
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentDescription">Descrição</Label>
            <Textarea
              id="documentDescription"
              placeholder="Descrição do documento"
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentFile">Arquivo *</Label>
            <Input id="documentFile" type="file" onChange={handleFileChange} />
            {documentFile && (
              <p className="text-sm text-gray-500">
                Tamanho: {formatFileSize(documentFile.size)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentType">Tipo de Documento</Label>
            <Input
              id="documentType"
              placeholder="Ex: RG, CNH, Contrato"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expirationDate">Data de Expiração</Label>
            <Input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Adicionar tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} variant="outline">
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="documentIsCritical"
              checked={documentIsCritical}
              onCheckedChange={(checked) =>
                setDocumentIsCritical(checked as boolean)
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Adicionar Documento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
