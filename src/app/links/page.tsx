import DashboardHeader from "@/components/dashboard-header";
import DashboardSidebar from "@/components/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Mail, ExternalLink, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function LinksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Mock data for generated links
  const links = [
    {
      id: "1",
      contractName: "Service Agreement - ABC Corp",
      url: "https://contractflow.com/form/abc123",
      createdAt: "2023-10-15",
      status: "signed",
      clientEmail: "client@abccorp.com",
    },
    {
      id: "2",
      contractName: "NDA - XYZ Startup",
      url: "https://contractflow.com/form/xyz456",
      createdAt: "2023-10-18",
      status: "pending",
      clientEmail: "founder@xyzstartup.com",
    },
    {
      id: "3",
      contractName: "Employment Contract - John Doe",
      url: "https://contractflow.com/form/john789",
      createdAt: "2023-10-20",
      status: "draft",
      clientEmail: "john.doe@example.com",
    },
  ];

  return (
    <>
      <DashboardHeader />
      <DashboardSidebar />
      <main className="p-4 sm:ml-64 pt-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Links Gerados</h1>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Gerar Novo Link</span>
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Link Recém Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">
                  Service Agreement - ABC Corp
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <Input
                      value="https://contractflow.com/form/abc123"
                      readOnly
                      className="bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copiar</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Enviar por E-mail</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Contrato</th>
                      <th className="px-6 py-3">Link</th>
                      <th className="px-6 py-3">Data de Criação</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Cliente</th>
                      <th className="px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr
                        key={link.id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium">
                          {link.contractName}
                        </td>
                        <td className="px-6 py-4 truncate max-w-[200px]">
                          {link.url}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={`${
                              link.status === "signed"
                                ? "bg-green-100 text-green-800"
                                : link.status === "pending"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {link.status === "signed"
                              ? "Assinado"
                              : link.status === "pending"
                                ? "Pendente"
                                : "Rascunho"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{link.clientEmail}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Copiar link</span>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Enviar por e-mail</span>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Abrir link</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
