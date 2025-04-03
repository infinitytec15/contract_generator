import Link from "next/link";
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
} from "lucide-react";

export default function DashboardSidebar() {
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contratos", href: "/contracts", icon: FileText },
    { name: "Formulários", href: "/forms", icon: FormInput },
    { name: "Envios", href: "/sends", icon: Send },
    { name: "Clientes", href: "/clients", icon: Users },
    { name: "Assinaturas", href: "/signatures", icon: PenTool },
    { name: "Planos", href: "/plans", icon: CreditCard },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

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
        </ul>
      </div>
    </aside>
  );
}
