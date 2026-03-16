import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import type { Business } from '@/shared/types/business';
import { User } from '@/shared/types/user';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, slug, user } = body as {
            name: string;
            slug: string;
            user: User;
        };

        if (!name?.trim() || !slug?.trim()) {
            return NextResponse.json(
                { error: 'name and slug are required' },
                { status: 400 }
            );
        }

        const supabaseAdmin = createAdminClient();

        const { data: businessData, error: businessError } = await supabaseAdmin
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

        const { error: staffError } = await supabaseAdmin.from('staff').insert({
            business_id: businessData.id,
            user_id: user.id,
            type: 'admin',
            name: user.name,
            email: user.email,
        });

        if (staffError) {
            return NextResponse.json(
                { error: staffError.message },
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
