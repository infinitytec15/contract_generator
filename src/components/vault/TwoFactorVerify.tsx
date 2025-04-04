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
import FormMessage from "@/components/form-message";
import { Shield, Lock } from "lucide-react";

interface TwoFactorVerifyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorVerify({
  isOpen,
  onClose,
  onSuccess,
}: TwoFactorVerifyProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");

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
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao verificar código");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message);
      console.error("Error verifying 2FA token:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Verificação de dois fatores
          </DialogTitle>
          <DialogDescription>
            Digite o código de verificação do seu aplicativo autenticador para
            acessar o cofre de documentos.
          </DialogDescription>
        </DialogHeader>

        {error && <FormMessage type="error" message={error} />}

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
                autoFocus
              />
              <p className="text-sm text-gray-500">
                Abra seu aplicativo autenticador e digite o código de 6 dígitos
                exibido para o VaultSystem.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
