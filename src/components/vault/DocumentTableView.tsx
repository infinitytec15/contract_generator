"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Eye, Download, Trash2, Lock } from "lucide-react";
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
  folder_path?: string;
}

interface DocumentTableViewProps {
  documents: VaultDocument[];
  activeTab: string;
  onViewDetails: (document: VaultDocument) => void;
  onDownload: (document: VaultDocument) => Promise<void>;
  onDelete: (document: VaultDocument) => void;
}

export default function DocumentTableView({
  documents,
  activeTab,
  onViewDetails,
  onDownload,
  onDelete,
}: DocumentTableViewProps) {
  const filteredDocuments = documents.filter(
    (doc) => activeTab === "all" || doc.folder_path === activeTab,
  );

  return (
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
        {filteredDocuments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
              Nenhum documento encontrado no cofre
            </TableCell>
          </TableRow>
        ) : (
          filteredDocuments.map((document) => (
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
              <TableCell>{document.file_type || "Desconhecido"}</TableCell>
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
                    onClick={() => onViewDetails(document)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(document)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(document)}
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
  );
}
