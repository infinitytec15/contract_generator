"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays } from "date-fns";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  // Placeholder data for charts
  const contractsData = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    datasets: [
      {
        label: "Contratos Gerados",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const signatureData = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    datasets: [
      {
        label: "Assinaturas",
        data: [10, 15, 2, 4, 1, 2],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const clientsData = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    datasets: [
      {
        label: "Novos Clientes",
        data: [5, 7, 2, 3, 1, 4],
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  const handleExportCSV = (reportType: string) => {
    // This will be implemented in a future step
    console.log(`Exporting ${reportType} report as CSV`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-4">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <Tabs defaultValue="contracts">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contratos Gerados</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV("contracts-generated")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
                <CardDescription>
                  Total de contratos gerados no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {/* Chart will be implemented in future steps */}
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">
                      Gráfico de Contratos Gerados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contratos Assinados</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCSV("contracts-signed")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
                <CardDescription>
                  Total de contratos assinados no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {/* Chart will be implemented in future steps */}
                  <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                    <p className="text-gray-500">
                      Gráfico de Contratos Assinados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Contratos</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("contracts-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todos os contratos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Novos Clientes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("new-clients")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Total de novos clientes no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {/* Chart will be implemented in future steps */}
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                  <p className="text-gray-500">Gráfico de Novos Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Clientes</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("clients-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todos os clientes no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Cadastro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Vendas por Plano</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("plan-sales")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Total de vendas por plano no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {/* Chart will be implemented in future steps */}
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                  <p className="text-gray-500">Gráfico de Vendas por Plano</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Vendas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV("sales-list")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
              <CardDescription>
                Detalhes de todas as vendas no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plano
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
