"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileSignature,
  LayoutDashboard,
  FileText,
  FormInput,
  Send,
  Users,
  PenTool,
  CreditCard,
  Settings,
  UserCog,
  Shield,
  Lock,
  MessageSquare,
  BarChart3,
  LucideIcon,
} from "lucide-react";
import { createClient } from "../../supabase/client";
import { z } from "zod";

// 1. Esquema de validação
const roleResponseSchema = z.object({
  role_id: z.string(),
  roles: z.object({
    name: z.string(),
  }).nullable(),
});

type RoleResponse = z.infer<typeof roleResponseSchema>;

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function DashboardSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserRole("client");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
          .from("user_roles")
          .select("role_id, roles(name)")
          .eq("user_id", user.id);

      if (error || !Array.isArray(data)) {
        console.error("Erro ao buscar função do usuário:", error?.message);
        setUserRole("client");
      } else {
        const parsed = z.array(roleResponseSchema).safeParse(data);

        if (!parsed.success) {
          console.error("Dados inválidos em user_roles:", parsed.error.format());
          setUserRole("client");
        } else {
          const userRoles = parsed.data;

          const isSuperAdmin = userRoles.some((r) => r.roles?.name === "super_admin");
          const isAdmin = userRoles.some((r) => r.roles?.name === "admin");

          if (isSuperAdmin) setUserRole("super_admin");
          else if (isAdmin) setUserRole("admin");
          else setUserRole("client");
        }
      }

      setIsLoading(false);
    };

    fetchUserRole();
  }, []);

  const getMenuItems = (): MenuItem[] => {
    const baseMenuItems: MenuItem[] = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Contratos", href: "/contracts", icon: FileText },
      { name: "Formulários", href: "/forms", icon: FormInput },
      { name: "Envios", href: "/sends", icon: Send },
      { name: "Clientes", href: "/clients", icon: Users },
      { name: "Assinaturas", href: "/signatures", icon: PenTool },
      { name: "Cofre", href: "/vault", icon: Lock },
      { name: "Tickets", href: "/tickets", icon: MessageSquare },
    ];

    if (userRole === "admin" || userRole === "super_admin") {
      baseMenuItems.push({
        name: "Relatórios",
        href: "/reports",
        icon: BarChart3,
      });
    }

    baseMenuItems.push({ name: "Planos", href: "/plans", icon: CreditCard });
    baseMenuItems.push({ name: "Configurações", href: "/settings", icon: Settings });

    return baseMenuItems;
  };

  const adminMenuItems: MenuItem[] = [
    { name: "Usuários", href: "/admin/users", icon: UserCog },
    { name: "Funções", href: "/admin/roles", icon: Shield },
    { name: "Tickets", href: "/admin/tickets", icon: MessageSquare },
  ];

  if (isLoading) {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-md pt-16">
          <div className="h-full px-3 py-4 overflow-y-auto">
            <div className="mb-5 flex items-center pl-2.5">
              <FileSignature className="h-6 w-6 text-blue-600 mr-2" />
              <span className="self-center text-xl font-semibold whitespace-nowrap">
              ContractFlow
            </span>
            </div>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </aside>
    );
  }

  const menuItems = getMenuItems();

  return (
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white shadow-md pt-16">
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-5 flex items-center pl-2.5">
            <FileSignature className="h-6 w-6 text-blue-600 mr-2" />
            <span className="self-center text-xl font-semibold whitespace-nowrap">
            ContractFlow
          </span>
          </div>
          <ul className="space-y-2 font-medium">
            {menuItems.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <Link
                      href={href}
                      className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group transition-all"
                  >
                    <Icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                    <span className="ml-3">{name}</span>
                  </Link>
                </li>
            ))}

            {userRole === "super_admin" && (
                <>
                  <li className="pt-5 pb-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administração
                    </div>
                  </li>
                  {adminMenuItems.map(({ name, href, icon: Icon }) => (
                      <li key={name}>
                        <Link
                            href={href}
                            className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group transition-all"
                        >
                          <Icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                          <span className="ml-3">{name}</span>
                        </Link>
                      </li>
                  ))}
                </>
            )}
          </ul>
        </div>
      </aside>
  );
}
