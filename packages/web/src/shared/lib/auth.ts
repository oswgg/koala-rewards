import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { serverAuthService } from '@/shared/services/auth/implementation.server-auth-service';
import type { Staff } from '@/shared/services/auth/interface.server-auth-service';
import { businessRoutes } from '@/shared/lib/routes';

/**
 * Gets the current session from the server (cookies).
 * Use in Server Components and layouts.
 */
export async function getServerSession() {
    const cookieStore = await cookies();
    return serverAuthService.getSessionFromCookies(cookieStore);
}

/**
 * Gets the staff record for the current user from the server.
 * Returns null if not authenticated or no staff record.
 */
export async function getServerStaff(): Promise<Staff | null> {
    const user = await getServerSession();
    if (!user?.id) return null;

    const supabase = createClient(cookies());
    const { data } = await supabase
        .from('staff')
        .select('id, business_id, user_id, type, name, email')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

    return data as Staff | null;
}

/**
 * Requires auth in a Server Component. Redirects to business login if not authenticated.
 */
export async function requireAuth(redirectTo: string) {
    const user = await getServerSession();
    if (!user) {
        redirect(redirectTo);
    }
    return user;
}

/**
 * Requires auth and staff in a Server Component.
 * Redirects to login if not authenticated, or to onboarding if no staff record.
 */
export async function requireAuthAndStaff() {
    const user = await requireAuth(businessRoutes.login);
    const staff = await getServerStaff();
    if (!staff) {
        redirect(businessRoutes.onboarding);
    }
    return { user, staff };
}
