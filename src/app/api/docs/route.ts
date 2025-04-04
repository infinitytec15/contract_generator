import { NextRequest, NextResponse } from "next/server";
import { getApiDocs } from "@/lib/swagger";

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Retorna a documentação OpenAPI
 *     description: Endpoint que retorna a especificação OpenAPI completa para a API
 *     tags:
 *       - documentation
 *     responses:
 *       200:
 *         description: Especificação OpenAPI em formato JSON
 */
export async function GET(req: NextRequest) {
  const spec = await getApiDocs();
  return NextResponse.json(spec);
}
