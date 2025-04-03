import { Bell, User } from "lucide-react";
import { createClient } from "../../supabase/server";
import UserProfile from "./user-profile";

export default async function DashboardHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <span className="self-center text-xl font-semibold whitespace-nowrap">
            ContractFlow
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="w-6 h-6" />
            <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full top-0 right-0">
              3
            </div>
          </button>
          <div className="flex items-center">
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
}
