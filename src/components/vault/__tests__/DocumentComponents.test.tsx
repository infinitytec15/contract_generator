import { render, screen, fireEvent } from "@testing-library/react";
import DocumentUploadDialog from "../DocumentUploadDialog";
import DocumentDeleteDialog from "../DocumentDeleteDialog";
import DocumentDetailsDialog from "../DocumentDetailsDialog";
import StorageUsageDisplay from "../StorageUsageDisplay";

// Mock document for testing
const mockDocument = {
  id: "1",
  name: "Test Document",
  description: "Test Description",
  file_path: "vault/test.pdf",
  file_url: "https://example.com/test.pdf",
  file_size: 1024 * 1024, // 1MB
  file_type: "application/pdf",
  is_critical: true,
  created_at: new Date().toISOString(),
  document_type: "Contract",
  tags: ["important", "legal"],
  extracted_text: "Sample extracted text",
  folder_path: "/2023/Legal/Contract",
};

describe("Document Components", () => {
  describe("StorageUsageDisplay", () => {
    test("displays storage usage correctly", () => {
      render(
        <StorageUsageDisplay
          storageUsed={1024 * 1024}
          storageLimit={10 * 1024 * 1024}
        />,
      );

      expect(screen.getByText(/Uso de Armazenamento/i)).toBeInTheDocument();
      expect(screen.getByText(/Utilizado: 1.0 MB/i)).toBeInTheDocument();
      expect(screen.getByText(/Limite: 10.0 MB/i)).toBeInTheDocument();
    });
  });

  describe("DocumentUploadDialog", () => {
    test("renders upload form correctly", () => {
      const mockOnUpload = jest.fn();

      render(
        <DocumentUploadDialog
          isOpen={true}
          onOpenChange={() => {}}
          onUpload={mockOnUpload}
          uploadProgress={0}
        />,
      );

      expect(screen.getByText(/Adicionar Novo Documento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome do Documento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Arquivo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Documento Crítico/i)).toBeInTheDocument();
    });

    test("shows upload progress when uploading", () => {
      render(
        <DocumentUploadDialog
          isOpen={true}
          onOpenChange={() => {}}
          onUpload={() => Promise.resolve()}
          uploadProgress={50}
        />,
      );

      expect(screen.getByText(/Progresso do Upload/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });
  });

  describe("DocumentDeleteDialog", () => {
    test("displays document information correctly", () => {
      render(
        <DocumentDeleteDialog
          isOpen={true}
          onOpenChange={() => {}}
          document={mockDocument}
          onDelete={() => Promise.resolve()}
        />,
      );

      expect(screen.getByText(/Excluir Documento/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
      expect(screen.getByText(/1.0 MB/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Este é um documento crítico/i),
      ).toBeInTheDocument();
    });
  });

  describe("DocumentDetailsDialog", () => {
    test("displays document details correctly", () => {
      render(
        <DocumentDetailsDialog
          isOpen={true}
          onOpenChange={() => {}}
          document={mockDocument}
          onDownload={() => Promise.resolve()}
        />,
      );

      expect(screen.getByText(/Test Document/i)).toBeInTheDocument();
      expect(screen.getByText(/Contract/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
      expect(screen.getByText(/application\/pdf/i)).toBeInTheDocument();
      expect(screen.getByText(/1.0 MB/i)).toBeInTheDocument();
      expect(screen.getByText(/\/2023\/Legal\/Contract/i)).toBeInTheDocument();
      expect(screen.getByText(/Sample extracted text/i)).toBeInTheDocument();
      expect(screen.getByText(/important/i)).toBeInTheDocument();
      expect(screen.getByText(/legal/i)).toBeInTheDocument();
      expect(screen.getByText(/Documento Crítico/i)).toBeInTheDocument();
    });
  });
});
