import { NextResponse } from 'next/server';
import { createAdminClient } from '@/infrastructure/supabase/admin';

/**
 * POST /api/auth/check-email
 * Verifica si existe un usuario con el email dado.
 * Usado en login para validar antes de enviar OTP.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required', exists: false },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();
        let page = 1;
        const perPage = 100;

        while (true) {
            const { data, error } = await supabase.auth.admin.listUsers({
                page,
                perPage,
            });

            if (error) {
                console.error('Error checking email:', error);
                return NextResponse.json(
                    { error: 'Failed to check email', exists: false },
                    { status: 500 }
                );
            }

            const user = data.users.find(
                (u) => u.email?.toLowerCase() === email
            );
            if (user) {
                return NextResponse.json({ exists: true });
            }

            if (data.users.length < perPage) {
                break;
            }
            page++;
        }

        return NextResponse.json({ exists: false });
    } catch (err) {
        console.error('Check email error:', err);
        return NextResponse.json(
            { error: 'Failed to check email', exists: false },
            { status: 500 }
        );
    }
}
