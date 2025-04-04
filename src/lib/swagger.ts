import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API de Gerenciamento de Contratos",
        version: "1.0.0",
        description:
          "Documentação da API para o sistema de gerenciamento de contratos, assinaturas digitais e clientes.",
        contact: {
          name: "Suporte",
          email: "suporte@exemplo.com",
        },
      },
      servers: [
        {
          url: "/api",
          description: "Servidor de API",
        },
      ],
      tags: [
        {
          name: "admin-dashboard",
          description: "Operações do painel administrativo",
        },
        {
          name: "admin-plans",
          description: "Gerenciamento de planos de assinatura",
        },
        {
          name: "admin-roles",
          description: "Gerenciamento de funções e permissões",
        },
        { name: "admin-users", description: "Gerenciamento de usuários" },
        { name: "contracts", description: "Gerenciamento de contratos" },
        { name: "dashboard", description: "Painel do usuário" },
        { name: "signatures", description: "Assinaturas digitais" },
        { name: "tickets", description: "Sistema de tickets de suporte" },
        { name: "webhooks", description: "Webhooks para integrações externas" },
        { name: "reports", description: "Relatórios e análises" },
        { name: "documentation", description: "Documentação da API" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              error: {
                type: "string",
              },
            },
            required: ["error"],
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  });
  return spec;
};
