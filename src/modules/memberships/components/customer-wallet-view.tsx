'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertDialog } from 'radix-ui';
import { CircleUser, CreditCard, LogOut, Plus, Bell } from 'lucide-react';
import { authService } from '@/shared/services/auth/implementation.auth-service';
import { customerRoutes } from '@/shared/lib/routes';
import { Button } from '@/shared/components/ui/button';
import { CardWallet } from '@/shared/components/wallets/card-wallet';
import { CardWalletSkeleton } from '@/shared/components/wallets/card-wallet-skeleton';
import { JoinProgramScanner } from './join-program-scanner';
import { useWalletCards } from '../hooks/useWalletCards';
import { cn } from '@/shared/lib/utils';

export function CustomerWalletView() {
    const router = useRouter();
    const [scannerOpen, setScannerOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const { cards, newlyAddedId, balanceChangedId, handleJoinSuccess, isLoading } =
        useWalletCards();

    const handleSignOut = async () => {
        setLogoutOpen(false);
        await authService.signOut();
        router.push(customerRoutes.login);
    };

    return (
        <div className="relative mx-auto flex min-h-svh max-w-md flex-col bg-neutral-100 dark:bg-neutral-950 scroball-hidden">
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-5 py-3 backdrop-blur-xl dark:bg-neutral-900/80">
                <div className="flex items-center gap-2.5">
                    <CircleUser strokeWidth={1.5} className="size-7 text-foreground" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Mis Tarjetas
                    </h1>
                </div>
                <button
                    type="button"
                    onClick={() => setLogoutOpen(true)}
                    aria-label="Cerrar sesión"
                    className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <LogOut className="size-5" strokeWidth={1.5} />
                </button>
            </header>

            <AlertDialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay
                        className={cn(
                            'fixed inset-0 z-100 bg-black/50',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
                        )}
                    />
                    <AlertDialog.Content
                        className={cn(
                            'fixed left-1/2 top-1/2 z-101 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
                            'rounded-xl border border-border bg-background p-6 shadow-lg',
                            'data-[state=open]:animate-in data-[state=closed]:animate-out',
                            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
                        )}
                    >
                        <AlertDialog.Title className="text-lg font-semibold">
                            ¿Cerrar sesión?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                            ¿Estás seguro de que quieres salir? Tendrás que iniciar sesión de nuevo
                            para ver tus tarjetas.
                        </AlertDialog.Description>
                        <div className="mt-6 flex gap-3 justify-end">
                            <AlertDialog.Cancel asChild>
                                <Button variant="outline" size="sm">
                                    No, quedarme
                                </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action asChild onSelect={handleSignOut}>
                                <Button variant="destructive" size="sm">
                                    Sí, salir
                                </Button>
                            </AlertDialog.Action>
                        </div>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>

            {isLoading ? (
                <CardWalletSkeleton />
            ) : (
                <CardWallet
                    memberships={cards}
                    newlyAddedId={newlyAddedId}
                    balanceChangedId={balanceChangedId}
                />
            )}

            <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-border/50 bg-white/90 px-6 pb-7 pt-2 backdrop-blur-xl dark:bg-neutral-900/90">
                <button
                    type="button"
                    aria-label="Tarjetas"
                    className="flex flex-col items-center gap-0.5"
                >
                    <CreditCard className="size-6 text-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium text-foreground">Tarjetas</span>
                </button>
                <button
                    type="button"
                    aria-label="Agregar tarjeta"
                    onClick={() => setScannerOpen(true)}
                    className="-mt-5 flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/20"
                >
                    <Plus className="size-7" strokeWidth={2} />
                </button>
                <button
                    type="button"
                    aria-label="Notificaciones"
                    className="flex flex-col items-center gap-0.5"
                >
                    <Bell className="size-6 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium text-muted-foreground">Alertas</span>
                </button>
            </nav>

            <JoinProgramScanner
                open={scannerOpen}
                onOpenChange={setScannerOpen}
                onJoinSuccess={handleJoinSuccess}
            />
        </div>
    );
}
