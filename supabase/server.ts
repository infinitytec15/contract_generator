import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string): string | undefined {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          },
          getAll(): { name: string; value: string }[] {
            const allCookies = cookieStore.getAll();
            return allCookies.map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          set(name: string, value: string, options?: CookieOptions): void {
            cookieStore.set(name, value, options);
          },
          delete(name: string): void {
            cookieStore.set(name, "", { maxAge: -1 });
          },
        },
      }
  );
};
