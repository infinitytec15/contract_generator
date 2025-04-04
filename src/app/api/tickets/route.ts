import { createClient } from "../../../../supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Lista todos os tickets
 *     description: Retorna uma lista de tickets com base nos filtros fornecidos. Administradores podem ver todos os tickets, enquanto usuários regulares só podem ver seus próprios tickets.
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, awaiting_response, responded, resolved, closed]
 *         description: Filtrar por status do ticket
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrar por prioridade do ticket
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *           enum: [support, billing, technical, sales]
 *         description: Filtrar por departamento
 *     responses:
 *       200:
 *         description: Lista de tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tickets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID do ticket
 *                       user_id:
 *                         type: string
 *                         description: ID do usuário que criou o ticket
 *                       title:
 *                         type: string
 *                         description: Título do ticket
 *                       description:
 *                         type: string
 *                         description: Descrição do ticket
 *                       status:
 *                         type: string
 *                         enum: [open, awaiting_response, responded, resolved, closed]
 *                         description: Status atual do ticket
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, critical]
 *                         description: Prioridade do ticket
 *                       department:
 *                         type: string
 *                         enum: [support, billing, technical, sales]
 *                         description: Departamento responsável pelo ticket
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Data de criação do ticket
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Data da última atualização do ticket
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the user is an admin
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(
      `
      role_id,
      roles(name)
    `,
    )
    .eq("user_id", user.id);

  const isAdmin =
    userRoles &&
    userRoles.some(
      (ur) => ur.roles?.name === "admin" || ur.roles?.name === "super_admin",
    );

  let query = supabase.from("tickets").select("*");

  // If not admin, only show user's tickets
  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  }

  // Get query parameters
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const department = url.searchParams.get("department");

  // Apply filters if provided
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (department) query = query.eq("department", department);

  // Order by created_at descending
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data });
}

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Cria um novo ticket
 *     description: Cria um novo ticket de suporte e notifica os administradores
 *     tags:
 *       - tickets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do ticket
 *               description:
 *                 type: string
 *                 description: Descrição detalhada do problema
 *               department:
 *                 type: string
 *                 enum: [support, billing, technical, sales]
 *                 description: Departamento para o qual o ticket é direcionado
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Prioridade do ticket
 *             required:
 *               - title
 *               - description
 *     responses:
 *       200:
 *         description: Ticket criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID do ticket
 *                     user_id:
 *                       type: string
 *                       description: ID do usuário que criou o ticket
 *                     title:
 *                       type: string
 *                       description: Título do ticket
 *                     description:
 *                       type: string
 *                       description: Descrição do ticket
 *                     status:
 *                       type: string
 *                       enum: [open, awaiting_response, responded, resolved, closed]
 *                       description: Status atual do ticket
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *                       description: Prioridade do ticket
 *                     department:
 *                       type: string
 *                       enum: [support, billing, technical, sales]
 *                       description: Departamento responsável pelo ticket
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Data de criação do ticket
 *       400:
 *         description: Requisição inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 },
      );
    }

    // Create ticket
    const { data, error } = await supabase
      .from("tickets")
      .insert([
        {
          user_id: user.id,
          title: body.title,
          description: body.description,
          department: body.department || "support", // Default to support
          priority: body.priority || "medium", // Default to medium
          status: "open", // Default status for new tickets
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for admins
    const { data: adminUsers } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("roles.name", ["admin", "super_admin"])
      .join("roles", { "user_roles.role_id": "roles.id" });

    if (adminUsers && adminUsers.length > 0) {
      const notifications = adminUsers.map((admin) => ({
        user_id: admin.user_id,
        title: "Novo Ticket",
        message: `Um novo ticket foi criado: ${body.title}`,
        read: false,
        link: `/admin/tickets/${data[0].id}`,
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return NextResponse.json({ ticket: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 },
    );
  }
}
