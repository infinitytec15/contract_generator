"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientDetails from "@/components/clients/ClientDetails";

export default function ClientDetailsPage({
  params,
}: {
  params: { clientId: string };
}) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchClient() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("id", params.clientId)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (error: any) {
        console.error("Error fetching client:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [params.clientId]);

  if (loading) {
    return <div className="p-8">Carregando detalhes do cliente...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Erro: {error}</div>;
  }

  if (!client) {
    return <div className="p-8">Cliente não encontrado</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link href="/clients">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Clientes
          </Button>
        </Link>
      </div>

      <ClientDetails client={client} />
    </div>
  );
}
