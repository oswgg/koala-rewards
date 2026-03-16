import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
    return createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
            getAll() {
                return cookieStore.then((cookie) => cookie.getAll());
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.then((cookie) =>
                            cookie.set(name, value, options)
                        )
                    );
                } catch (error) {
                    console.error(error);
                }
            },
        },
    });
};
