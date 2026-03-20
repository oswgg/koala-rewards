import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createClient } from '@/infrastructure/supabase/server';
import type { Business } from '@/shared/types/business';
import { serverAuthService } from '@/shared/services/auth/implementation.server-auth-service';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const authUser = await serverAuthService.getSessionFromCookies(cookieStore);
        if (!authUser?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug } = body as { name: string; slug: string };

        if (!name?.trim() || !slug?.trim()) {
            return NextResponse.json(
                { error: 'name and slug are required' },
                { status: 400 }
            );
        }

        const supabase = createClient(Promise.resolve(cookieStore));

        const { data: businessData, error: businessError } = await supabase
            .from('businesses')
            .insert({ name: name.trim(), slug: slug.trim() })
            .select()
            .single();

        if (businessError) {
            return NextResponse.json(
                { error: businessError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(businessData as Business);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : 'Failed to create business';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
