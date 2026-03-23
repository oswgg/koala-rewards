import { type NextRequest } from 'next/server';
import { serverAuthService } from '@/shared/services/auth/implementation.server-auth-service';

/**
 * Proxy: refresca la sesión de Supabase (cookies).
 * La protección de rutas se aplica en los layouts (requireAuth, requireAuthAndStaff).
 */
export async function proxy(request: NextRequest) {
    const { response } = await serverAuthService.getSessionFromRequest(request);
    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
