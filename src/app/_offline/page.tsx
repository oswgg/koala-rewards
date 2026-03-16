'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WifiOff, ArrowRight, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

export default function OfflinePage() {
    const router = useRouter();
    const { isOnline } = useNetworkStatus();
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        const hasAuthCookie = document.cookie
            .split(';')
            .some((c) => c.trim().startsWith('sb-') && c.includes('auth-token'));
        setHasSession(hasAuthCookie);
    }, []);

    useEffect(() => {
        if (isOnline) {
            router.replace('/');
        }
    }, [isOnline, router]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 text-center">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-6">
                <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <WifiOff className="size-10 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Sin conexión</h1>
                    <p className="text-sm text-muted-foreground">
                        No tienes conexión a internet en este momento.
                    </p>
                </div>

                {hasSession === true && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Tus tarjetas guardadas siguen disponibles.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                        >
                            Ver mis tarjetas
                            <ArrowRight className="size-4" />
                        </button>
                    </div>
                )}

                {hasSession === false && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Necesitas conexión a internet para iniciar sesión o crear una cuenta.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            <RefreshCw className="size-4" />
                            Reintentar
                        </button>
                        <p className="text-xs text-muted-foreground/70">
                            Conéctate a una red Wi-Fi o activa tus datos móviles.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
