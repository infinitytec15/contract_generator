import axios from "axios";

const ZAPSIGN_API_URL = "https://api.zapsign.com.br/api/v1";

interface ZapSignConfig {
  apiKey: string;
}

export class ZapSignClient {
  private apiKey: string;

  constructor(config: ZapSignConfig) {
    this.apiKey = config.apiKey;
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Cria um novo documento para assinatura
   */
  async createDocument(params: {
    name: string;
    base64_pdf: string;
    signers: Array<{
      name: string;
      email: string;
      phone_country?: string;
      phone_number?: string;
      auth_mode?: "email" | "sms" | "whatsapp" | "selfie";
      send_automatic_email?: boolean;
      send_automatic_whatsapp?: boolean;
      lock_document?: boolean;
    }>;
    brand_logo?: string;
    brand_primary_color?: string;
    brand_name?: string;
    external_id?: string;
    lang?: "pt-br" | "en-us" | "es";
    disable_signer_emails?: boolean;
  }) {
    try {
      const response = await axios.post(`${ZAPSIGN_API_URL}/docs/`, params, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating ZapSign document:", error);
      throw error;
    }
  }

  /**
   * Obtém informações de um documento
   */
  async getDocument(token: string) {
    try {
      const response = await axios.get(`${ZAPSIGN_API_URL}/docs/${token}/`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error getting ZapSign document:", error);
      throw error;
    }
  }

  /**
   * Obtém o status de um documento
   */
  async getDocumentStatus(token: string) {
    try {
      const response = await axios.get(
        `${ZAPSIGN_API_URL}/docs/${token}/status/`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Error getting ZapSign document status:", error);
      throw error;
    }
  }

  /**
   * Obtém o link para assinatura de um signatário
   */
  async getSignerLink(docToken: string, signerToken: string) {
    try {
      const response = await axios.get(
        `${ZAPSIGN_API_URL}/docs/${docToken}/signers/${signerToken}/sign-link/`,
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Error getting ZapSign signer link:", error);
      throw error;
    }
  }

  /**
   * Envia um lembrete para um signatário
   */
  async sendReminder(docToken: string, signerToken: string) {
    try {
      const response = await axios.post(
        `${ZAPSIGN_API_URL}/docs/${docToken}/signers/${signerToken}/send-reminder/`,
        {},
        { headers: this.getHeaders() },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending ZapSign reminder:", error);
      throw error;
    }
  }

  /**
   * Obtém o PDF assinado
   */
  async getSignedPdf(token: string) {
    try {
      const response = await axios.get(
        `${ZAPSIGN_API_URL}/docs/${token}/download/signed/`,
        {
          headers: this.getHeaders(),
          responseType: "arraybuffer",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading signed PDF:", error);
      throw error;
    }
  }
}

export function createZapSignClient() {
  // Obter a chave da API das variáveis de ambiente
  const apiKey = process.env.ZAPSIGN_API_KEY;

  if (!apiKey) {
    throw new Error("ZAPSIGN_API_KEY environment variable is not set");
  }

  return new ZapSignClient({ apiKey });
}
