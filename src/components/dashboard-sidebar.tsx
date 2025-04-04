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
} from "lucide-react";
import { createClient } from "../../supabase/client";

export default function DashboardSidebar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get user's roles
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select(
            `
            role_id,
            roles(name)
          `,
          )
          .eq("user_id", user.id);

        if (userRoles && userRoles.length > 0) {
          // Check if user has super_admin role
          const isSuperAdmin = userRoles.some(
            (ur) => ur.roles?.name === "super_admin",
          );
          if (isSuperAdmin) {
            setUserRole("super_admin");
          } else if (userRoles.some((ur) => ur.roles?.name === "admin")) {
            setUserRole("admin");
          } else {
            setUserRole("client");
          }
        } else {
          setUserRole("client"); // Default role
        }
      }

      setIsLoading(false);
    };

    fetchUserRole();
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contratos", href: "/contracts", icon: FileText },
    { name: "Formulários", href: "/forms", icon: FormInput },
    { name: "Envios", href: "/sends", icon: Send },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Assinaturas", href: "/signatures", icon: PenTool },
    { name: "Tickets", href: "/tickets", icon: MessageSquare },
    { name: "Planos", href: "/plans", icon: CreditCard },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  // Admin menu items only visible to super_admin
  const adminMenuItems = [
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
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group transition-all"
              >
                <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                <span className="ml-3">{item.name}</span>
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
              {adminMenuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 group transition-all"
                  >
                    <item.icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                    <span className="ml-3">{item.name}</span>
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
