"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

interface UserProfileData {
    email: string;
    full_name?: string;
}

export default function UserProfile() {
    const [user, setUser] = useState<UserProfileData | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setUser({ email: user.email ?? "", full_name: user.user_metadata?.full_name });
            }
        };

        fetchUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserCircle className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {user && (
                    <div className="px-4 py-2 text-sm text-gray-500">
                        <p className="font-medium truncate">{user.full_name || "Usuário"}</p>
                        <p className="truncate">{user.email}</p>
                    </div>
                )}
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}