'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/client';
import { customerRoutes } from '@/shared/lib/routes';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) {
                router.replace(customerRoutes.login);
            } else {
                setReady(true);
            }
        });
    }, [router]);

    if (!ready) return null;

    return <>{children}</>;
}
