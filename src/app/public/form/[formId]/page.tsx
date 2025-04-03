"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSignature, ArrowRight, Loader2 } from "lucide-react";

export default function PublicFormPage({
  params,
}: {
  params: { formId: string };
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [cepLoading, setCepLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If CEP field is changed and has 8 digits, fetch address data
    if (name === "cep" && value.replace(/\D/g, "").length === 8) {
      fetchAddressByCep(value);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    setCepLoading(true);
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
      }
    } catch (error) {
      console.error("Error fetching CEP data:", error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Redirect to preview page
      window.location.href = `/public/preview/${params.formId}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileSignature className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            Preencha os dados para seu contrato
          </h1>
          <p className="text-gray-600 mt-2">
            Todos os campos marcados com * são obrigatórios
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center">
                    Nome Completo <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Digite seu nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="flex items-center">
                      CPF <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      E-mail <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="flex items-center">
                      CEP <span className="text-red-500 ml-1">*</span>
                      {cepLoading && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                    </Label>
                    <Input
                      id="cep"
                      name="cep"
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center">
                    Endereço <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Rua, número"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood" className="flex items-center">
                      Bairro <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      placeholder="Seu bairro"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center">
                      Cidade <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Sua cidade"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="flex items-center">
                      Estado <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="UF"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Gerar Contrato</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} ContractFlow. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>{" "}
            |
            <a href="#" className="text-blue-600 hover:underline ml-2">
              Termos de Uso
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
