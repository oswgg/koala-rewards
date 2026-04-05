'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authRepository } from '@/infrastructure';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@vado/shared/hooks';

export default function LoginPage() {
    const router = useRouter();
    const { user, isLoading } = useUser({ authRepository });

    useEffect(() => {
        if (!isLoading && user) {
            router.replace('/');
        }
    }, [isLoading, router, user]);

    if (isLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-background">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-background">
                <p className="text-muted-foreground">Redirigiendo...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 pt-24">
            <div className="w-full max-w-sm">
                <AuthForm type="login" redirectTo="/" />
            </div>
        </div>
    );
}
