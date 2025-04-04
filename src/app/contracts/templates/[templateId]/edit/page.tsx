"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TemplateEditPage({
  params,
}: {
  params: { templateId: string };
}) {
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchTemplate() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("contract_templates")
          .select("*")
          .eq("id", params.templateId)
          .single();

        if (error) throw error;
        setTemplate(data);
      } catch (error: any) {
        console.error("Error fetching template:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplate();
  }, [params.templateId]);

  if (loading) {
    return <div className="p-8">Carregando detalhes do template...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro: {error}</div>;
  }

  if (!template) {
    return <div className="p-8">Template não encontrado</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link href="/contracts">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Contratos
          </Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">
          Editar Template: {template.name}
        </h1>

        {/* Template editor would go here */}
        <div className="p-4 bg-gray-50 rounded border border-gray-200 mb-4">
          <p className="text-gray-500">Editor de template em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}
