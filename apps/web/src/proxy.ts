import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

const refreshSession = async (request: NextRequest) => {
    let response = NextResponse.next({ request });

    // If env vars are missing, continue request without session refresh.
    if (!supabaseUrl || !supabaseKey) {
        return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    await supabase.auth.getUser();
    return response;
};

/**
 * Proxy: refresca la sesión de Supabase (cookies).
 * La protección de rutas se aplica en los layouts (requireAuth, requireAuthAndStaff).
 */
export async function proxy(request: NextRequest) {
    return refreshSession(request);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
