'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/shared/components/auth-form';
import { customerPortalRoutes } from '@vado/loyalty';

function LoginContent() {
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const redirectTo = returnUrl ? decodeURIComponent(returnUrl) : customerPortalRoutes.app;

    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-sm">
                <AuthForm
                    type="login"
                    redirectTo={redirectTo}
                    redirectOnChange={{
                        login: returnUrl
                            ? `${customerPortalRoutes.login}?returnUrl=${encodeURIComponent(returnUrl)}`
                            : customerPortalRoutes.login,
                        signup: returnUrl
                            ? `${customerPortalRoutes.signup}?returnUrl=${encodeURIComponent(returnUrl)}`
                            : customerPortalRoutes.signup,
                    }}
                />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-svh flex-col items-center justify-center p-6 bg-background">
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
