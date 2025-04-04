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
import { Progress } from "@/components/ui/progress";
import FormMessage from "@/components/form-message";
import { Shield, Lock, QrCode } from "lucide-react";
import Image from "next/image";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  is2FAEnabled: boolean;
}

export default function TwoFactorSetup({
  isOpen,
  onClose,
  onSuccess,
  is2FAEnabled,
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<"intro" | "qrcode" | "verify">("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/vault/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao configurar 2FA");
      }

      setQrCodeUri(data.qrCodeUri);
      setSecret(data.secret);
      setStep("qrcode");
    } catch (error: any) {
      setError(error.message);
      console.error("Error setting up 2FA:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
        setError("Por favor, insira um código válido de 6 dígitos");
        return;
      }

      const response = await fetch("/api/vault/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, isSetup: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao verificar código");
      }

      setSuccess("Autenticação de dois fatores ativada com sucesso!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message);
      console.error("Error verifying 2FA token:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderQRCode = () => {
    if (!qrCodeUri) return null;

    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              qrCodeUri,
            )}`}
            alt="QR Code para 2FA"
            width={200}
            height={200}
          />
        </div>
        {secret && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Código secreto (caso não consiga escanear o QR code):
            </p>
            <code className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
              {secret}
            </code>
          </div>
        )}
        <Button onClick={() => setStep("verify")} className="mt-2">
          Continuar
        </Button>
      </div>
    );
  };

  const renderVerification = () => {
    return (
      <div className="py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Código de verificação</Label>
            <Input
              id="token"
              placeholder="Digite o código de 6 dígitos"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
            />
            <p className="text-sm text-gray-500">
              Abra seu aplicativo autenticador e digite o código de 6 dígitos
              exibido para o VaultSystem.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setStep("qrcode")}>
            Voltar
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? "Verificando..." : "Verificar e Ativar"}
          </Button>
        </div>
      </div>
    );
  };

  const renderIntro = () => {
    return (
      <div className="py-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">
                Proteja seu cofre com autenticação de dois fatores
              </h3>
              <p className="text-sm text-blue-700">
                A autenticação de dois fatores adiciona uma camada extra de
                segurança ao seu cofre, exigindo um código temporário além da
                sua senha.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <QrCode className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">1. Escaneie o código QR</h4>
              <p className="text-sm text-gray-500">
                Use um aplicativo autenticador como Google Authenticator,
                Microsoft Authenticator ou Authy.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <Lock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">2. Verifique o código</h4>
              <p className="text-sm text-gray-500">
                Digite o código de 6 dígitos gerado pelo aplicativo para
                confirmar a configuração.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSetup} disabled={loading}>
            {loading ? "Configurando..." : "Configurar 2FA"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            {is2FAEnabled
              ? "Autenticação de dois fatores"
              : "Configurar autenticação de dois fatores"}
          </DialogTitle>
          <DialogDescription>
            {is2FAEnabled
              ? "Sua conta já está protegida com autenticação de dois fatores."
              : "Adicione uma camada extra de segurança ao seu cofre de documentos."}
          </DialogDescription>
        </DialogHeader>

        {error && <FormMessage type="error" message={error} />}
        {success && <FormMessage type="success" message={success} />}

        {is2FAEnabled ? (
          <div className="py-4">
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800 mb-1">
                    2FA está ativado
                  </h3>
                  <p className="text-sm text-green-700">
                    Seu cofre está protegido com autenticação de dois fatores.
                    Você precisará fornecer um código de verificação ao acessar
                    seus documentos.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : step === "intro" ? (
          renderIntro()
        ) : step === "qrcode" ? (
          renderQRCode()
        ) : (
          renderVerification()
        )}
      </DialogContent>
    </Dialog>
  );
}
