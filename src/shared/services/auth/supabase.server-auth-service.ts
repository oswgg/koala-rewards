import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type {
    ServerAuthService,
    CookieStore,
    Staff,
} from './interface.server-auth-service';
import type { User } from '@/shared/types/user';
import { toUser } from './implementation.auth-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

function createSupabaseClient(request: NextRequest) {
    const state: { response: NextResponse } = {
        response: NextResponse.next({
            request: { headers: request.headers },
        }),
    };

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                );
                state.response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                    state.response.cookies.set(name, value, options)
                );
            },
        },
    });

    return { supabase, getResponse: () => state.response };
}

export const supabaseServerAuthService: ServerAuthService = {
    getSessionFromRequest: async (
        request: NextRequest
    ): Promise<{ user: User | null; response: NextResponse }> => {
        const { supabase, getResponse } = createSupabaseClient(request);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return { user: toUser(user), response: getResponse() };
    },

    getSessionAndStaffFromRequest: async (
        request: NextRequest
    ): Promise<{ user: User | null; staff: Staff | null; response: NextResponse }> => {
        const { supabase, getResponse } = createSupabaseClient(request);
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const authUser = toUser(user);

        if (!authUser?.id) {
            return { user: null, staff: null, response: getResponse() };
        }

        const { data: staff } = await supabase
            .from('staff')
            .select('id, business_id, user_id, type, name, email')
            .eq('user_id', authUser.id)
            .limit(1)
            .maybeSingle();

        return { user: authUser, staff: staff as Staff | null, response: getResponse() };
    },

    getSessionFromCookies: async (
        cookieStore: CookieStore
    ): Promise<User | null> => {
        const { createClient } = await import(
            '@/infrastructure/supabase/server'
        );
        const supabase = createClient(Promise.resolve(cookieStore));
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return toUser(user);
    },
};
