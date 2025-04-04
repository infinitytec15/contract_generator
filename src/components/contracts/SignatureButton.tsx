"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSignature, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface SignatureButtonProps {
  contractId: string;
  disabled?: boolean;
  status?: string;
  userName?: string;
  onSuccess?: () => void;
}

export default function SignatureButton({
  contractId,
  disabled = false,
  status,
  userName,
  onSuccess,
}: SignatureButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Animação de entrada com GSAP
    if (buttonRef.current) {
      gsap.from(buttonRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, []);

  const handleSignatureRequest = async () => {
    try {
      setLoading(true);

      // Animação do botão durante o carregamento
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.2,
          repeat: -1,
          yoyo: true,
        });
      }

      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Falha ao enviar contrato para assinatura",
        );
      }

      // Animação de sucesso
      if (buttonRef.current) {
        gsap.killTweensOf(buttonRef.current);
        gsap.to(buttonRef.current, {
          scale: 1.1,
          duration: 0.2,
          onComplete: () => {
            gsap.to(buttonRef.current, {
              scale: 1,
              duration: 0.2,
            });
          },
        });
      }

      toast({
        title: "Contrato enviado para assinatura",
        description:
          "Os signatários receberão um email com o link para assinatura.",
        variant: "default",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error sending contract for signature:", error);

      // Animação de erro
      if (buttonRef.current) {
        gsap.killTweensOf(buttonRef.current);
        gsap.to(buttonRef.current, {
          x: 10,
          duration: 0.1,
          repeat: 3,
          yoyo: true,
          onComplete: () => {
            gsap.to(buttonRef.current, {
              x: 0,
              duration: 0.2,
            });
          },
        });
      }

      toast({
        title: "Erro ao enviar para assinatura",
        description:
          error.message ||
          "Ocorreu um erro ao enviar o contrato para assinatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Determinar o texto do botão com base no status
  let buttonText = "Enviar para Assinatura";
  let buttonDisabled = disabled || loading;

  if (status === "pending") {
    buttonText = "Aguardando Assinaturas";
    buttonDisabled = true;
  } else if (status === "partially_signed") {
    buttonText = "Parcialmente Assinado";
    buttonDisabled = true;
  } else if (status === "signed") {
    buttonText = "Contrato Assinado";
    buttonDisabled = true;
  } else if (status === "refused") {
    buttonText = "Contrato Recusado";
    buttonDisabled = true;
  }

  return (
    <Button
      ref={buttonRef}
      onClick={handleSignatureRequest}
      disabled={buttonDisabled}
      className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSignature className="h-4 w-4" />
      )}
      {buttonText}
    </Button>
  );
}
