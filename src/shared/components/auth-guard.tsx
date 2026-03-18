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
                const returnUrl =
                    typeof window !== 'undefined'
                        ? encodeURIComponent(window.location.href)
                        : '';
                const loginUrl = returnUrl
                    ? `${customerRoutes.login}?returnUrl=${returnUrl}`
                    : customerRoutes.login;
                router.replace(loginUrl);
            } else {
                setReady(true);
            }
        });
    }, [router]);

    if (!ready) return null;

    return <>{children}</>;
}
