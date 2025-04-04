"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ContractChatbotProps {
  contractId: string;
  contractName?: string;
}

export default function ContractChatbot({
  contractId,
  contractName = "Contrato",
}: ContractChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Olá! Sou o assistente jurídico do ${contractName}. Como posso ajudar você hoje? Você pode me perguntar sobre datas importantes, cláusulas específicas ou responsabilidades.`,
        timestamp: new Date(),
      },
    ]);
  }, [contractName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call API to get response
      const response = await fetch(`/api/contracts/${contractId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: `response-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Desculpe, tive um problema ao processar sua pergunta. Poderia tentar novamente?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to handle sending message when API is not available
  const handleSendMessageMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let response = "";
      const lowercaseInput = input.toLowerCase();

      // Mock responses based on common questions
      if (
        lowercaseInput.includes("expira") ||
        lowercaseInput.includes("vencimento") ||
        lowercaseInput.includes("término")
      ) {
        response = "Este contrato expira em 15 de dezembro de 2024.";
      } else if (
        lowercaseInput.includes("responsável") ||
        lowercaseInput.includes("gestor")
      ) {
        response =
          "O responsável por este contrato é Maria Silva (maria.silva@empresa.com).";
      } else if (
        lowercaseInput.includes("rescisão") ||
        lowercaseInput.includes("cancelamento")
      ) {
        response =
          "A cláusula 8.3 trata da rescisão contratual. Ela estabelece que qualquer parte pode rescindir o contrato com aviso prévio de 30 dias, sujeito a multa de 20% do valor remanescente.";
      } else if (
        lowercaseInput.includes("renovação") ||
        lowercaseInput.includes("renovar")
      ) {
        response =
          "Sim, este contrato possui renovação automática por períodos iguais de 12 meses, conforme cláusula 10.1, a menos que uma das partes notifique a outra com 60 dias de antecedência.";
      } else if (
        lowercaseInput.includes("multa") ||
        lowercaseInput.includes("penalidade")
      ) {
        response =
          "A cláusula 9.2 estabelece multa de 2% mais juros de 1% ao mês para pagamentos em atraso. Para rescisão antecipada, a multa é de 20% do valor remanescente do contrato.";
      } else if (
        lowercaseInput.includes("pagamento") ||
        lowercaseInput.includes("valor")
      ) {
        response =
          "O valor mensal deste contrato é de R$ 5.000,00, com pagamento até o dia 10 de cada mês, conforme cláusula 5.1.";
      } else if (lowercaseInput.includes("reajuste")) {
        response =
          "O contrato prevê reajuste anual pelo IPCA, conforme cláusula 5.3.";
      } else if (
        lowercaseInput.includes("confidencialidade") ||
        lowercaseInput.includes("sigilo")
      ) {
        response =
          "A cláusula 12 trata da confidencialidade, que se estende por 5 anos após o término do contrato.";
      } else {
        response =
          "Não tenho informações específicas sobre isso. Poderia reformular sua pergunta ou perguntar sobre datas de vencimento, responsáveis, cláusulas de rescisão ou renovação?";
      }

      const assistantMessage: Message = {
        id: `response-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Assistente Jurídico</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === "assistant" ? (
                    <>
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/user-avatar.png" />
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`p-3 rounded-lg ${message.role === "assistant" ? "bg-blue-50 text-gray-800" : "bg-gray-100 text-gray-800"}`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-blue-50 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Analisando contrato...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessageMock} // Use mock function for now
          className="flex gap-2 mt-auto"
        >
          <Input
            placeholder="Digite sua pergunta sobre o contrato..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
