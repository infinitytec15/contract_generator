"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Trash2, Lock } from "lucide-react";

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

interface DocumentTimelineViewProps {
  documents: VaultDocument[];
  activeTab: string;
  onViewDetails: (document: VaultDocument) => void;
  onDownload: (document: VaultDocument) => Promise<void>;
  onDelete: (document: VaultDocument) => void;
}

export default function DocumentTimelineView({
  documents,
  activeTab,
  onViewDetails,
  onDownload,
  onDelete,
}: DocumentTimelineViewProps) {
  const filteredDocuments = documents.filter(
    (doc) => activeTab === "all" || doc.folder_path === activeTab,
  );

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum documento encontrado para esta visualização
      </div>
    );
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:bg-gray-200 before:content-['']">
      {filteredDocuments
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((document) => (
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
                    {new Date(document.created_at).toLocaleDateString()} às{" "}
                    {new Date(document.created_at).toLocaleTimeString()}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(document)}
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
  );
}
