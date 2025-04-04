"use client";

import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  FileSignature,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { gsap } from "gsap";

interface SignatureStatusProps {
  contractId: string;
  initialStatus?: string;
  refreshInterval?: number; // em milissegundos
}

export default function SignatureStatus({
  contractId,
  initialStatus,
  refreshInterval = 30000, // 30 segundos por padrão
}: SignatureStatusProps) {
  const [status, setStatus] = useState(initialStatus || "not_sent");
  const [loading, setLoading] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/contracts/${contractId}/signature-status`,
      );
      const data = await response.json();

      if (response.ok && data.status && data.status !== status) {
        // Animar a mudança de status
        if (statusRef.current) {
          gsap.to(statusRef.current, {
            y: -10,
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              setStatus(data.status);
              gsap.fromTo(
                statusRef.current,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3 },
              );
            },
          });
        } else {
          setStatus(data.status);
        }
      }
    } catch (error) {
      console.error("Error fetching signature status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Buscar status inicial
    fetchStatus();

    // Configurar intervalo de atualização
    const interval = setInterval(fetchStatus, refreshInterval);

    // Limpar intervalo ao desmontar
    return () => clearInterval(interval);
  }, [contractId, refreshInterval]);

  // Determinar cor e ícone com base no status
  let badgeClass = "bg-gray-100 text-gray-800";
  let Icon = Clock;
  let statusText = "Não enviado";

  switch (status) {
    case "pending":
      badgeClass = "bg-yellow-100 text-yellow-800";
      Icon = Clock;
      statusText = "Aguardando Assinaturas";
      break;
    case "partially_signed":
      badgeClass = "bg-blue-100 text-blue-800";
      Icon = FileSignature;
      statusText = "Parcialmente Assinado";
      break;
    case "signed":
      badgeClass = "bg-green-100 text-green-800";
      Icon = CheckCircle;
      statusText = "Assinado";
      break;
    case "refused":
      badgeClass = "bg-red-100 text-red-800";
      Icon = XCircle;
      statusText = "Recusado";
      break;
    case "expired":
      badgeClass = "bg-orange-100 text-orange-800";
      Icon = AlertCircle;
      statusText = "Expirado";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800";
      Icon = Clock;
      statusText = "Não enviado";
  }

  return (
    <div ref={statusRef} className="inline-flex items-center">
      <Badge className={`${badgeClass} flex items-center gap-1 px-3 py-1`}>
        <Icon className="h-3.5 w-3.5" />
        <span>{statusText}</span>
      </Badge>
    </div>
  );
}
