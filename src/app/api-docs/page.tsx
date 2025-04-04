"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocs() {
  const [spec, setSpec] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      const response = await fetch("/api/docs");
      const data = await response.json();
      setSpec(data);
    };

    fetchSpec();
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Carregando documentação da API...
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Documentação da API</h1>
      <div className="bg-white rounded-lg shadow-lg">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
