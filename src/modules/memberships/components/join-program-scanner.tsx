'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { MembershipCardPreview } from '@/shared/components/wallets/membership-card-preview';
import { AuthForm } from '@/shared/components/auth-form';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { useProgramByPublicId } from '@/modules/programs/hooks/useProgramByPublicId';
import { useJoinProgram } from '@/modules/memberships/hooks/useJoinProgram';
import { useHasMembership } from '@/modules/memberships/hooks/useHasMembership';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

const SCANNER_ELEMENT_ID = 'join-program-qr-scanner';

function extractProgramPublicIdFromQR(text: string): string | null {
    try {
        let url: URL | null = null;
        if (text.startsWith('http://') || text.startsWith('https://')) {
            url = new URL(text);
        }

        const pathname = url ? url.pathname : text;
        const match = pathname.match(/^\/join\/([^/?#]+)/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

export interface JoinProgramScannerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJoinSuccess?: (membership: MembershipWithProgram) => void;
}

export function JoinProgramScanner({ open, onOpenChange, onJoinSuccess }: JoinProgramScannerProps) {
    const [programPublicId, setProgramPublicId] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);
    const processedRef = useRef(false);

    const { isAuthenticated, isLoading: authLoading, user } = useAuthSession();
    const {
        program,
        isLoading: programLoading,
        isError: programError,
    } = useProgramByPublicId(programPublicId ?? undefined);
    const { hasMembership, isLoading: membershipLoading } = useHasMembership(program?.id, user?.id);
    const joinMutation = useJoinProgram();

    const stopScanner = useCallback(async () => {
        if (scannerRef.current && isScanningRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.warn('Error stopping QR scanner:', err);
            }
            scannerRef.current.clear();
            scannerRef.current = null;
            isScanningRef.current = false;
        }
    }, []);

    const handleScanSuccessRef = useRef((decodedText: string) => {
        if (processedRef.current) return;
        const id = extractProgramPublicIdFromQR(decodedText);
        if (id) {
            processedRef.current = true;
            stopScanner();
            setProgramPublicId(id);
        }
    });
    handleScanSuccessRef.current = (decodedText: string) => {
        if (processedRef.current) return;
        const id = extractProgramPublicIdFromQR(decodedText);
        if (id) {
            processedRef.current = true;
            stopScanner();
            setProgramPublicId(id);
        }
    };

    const handleClose = useCallback(() => {
        setProgramPublicId(null);
        processedRef.current = false;
        onOpenChange(false);
    }, [onOpenChange]);

    const handleReject = useCallback(() => {
        setProgramPublicId(null);
        onOpenChange(false);
        processedRef.current = false;
    }, [onOpenChange]);

    const handleJoin = useCallback(async () => {
        if (!user?.id || !program) return;

        try {
            const membership = await joinMutation.mutateAsync({
                programId: program.id,
                userId: user.id,
            });
            const membershipWithProgram: MembershipWithProgram = {
                ...membership,
                program,
            };
            handleClose();
            onJoinSuccess?.(membershipWithProgram);
        } catch (error) {
            console.error('Error al unirse al programa:', error);
        }
    }, [program, user?.id, joinMutation, handleClose, onJoinSuccess]);

    const handleAuthSuccess = useCallback(() => {
        // After login, user is authenticated; preview will show automatically
    }, []);

    useEffect(() => {
        if (!open) {
            processedRef.current = false;
            setProgramPublicId(null);
            stopScanner();
            return;
        }

        processedRef.current = false;
        setProgramPublicId(null);
        let mounted = true;

        const startScanner = async () => {
            if (!mounted || !open) return;

            await new Promise((r) => setTimeout(r, 100));
            if (!mounted) return;

            if (!document.getElementById(SCANNER_ELEMENT_ID)) {
                if (mounted) onOpenChange(false);
                return;
            }

            try {
                const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (mounted) handleScanSuccessRef.current(decodedText);
                    },
                    () => {}
                );
                isScanningRef.current = true;
            } catch (err) {
                console.error('Error starting QR scanner:', err);
                if (mounted) onOpenChange(false);
            }
        };

        startScanner();

        return () => {
            mounted = false;
            stopScanner();
        };
    }, [open, stopScanner, onOpenChange]);

    const showPreview = programPublicId !== null;
    const isLoadingProgram = programLoading || membershipLoading;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                showCloseButton={false}
                className="h-[90vh] flex flex-col gap-4 overflow-y-auto overflow-x-hidden"
            >
                <SheetHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div>
                        <SheetTitle>
                            {showPreview ? 'Unirte al programa' : 'Escanear código QR'}
                        </SheetTitle>
                        <SheetDescription>
                            {showPreview
                                ? 'Revisa los detalles y agrega la tarjeta a tu cuenta'
                                : 'Apunta la cámara al código QR del programa para unirte'}
                        </SheetDescription>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Cerrar"
                        className="rounded-full p-2 hover:bg-muted transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </SheetHeader>

                {showPreview ? (
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-8">
                        {authLoading ? (
                            <p className="py-8 text-center text-muted-foreground">Cargando...</p>
                        ) : !isAuthenticated ? (
                            <AuthForm
                                type="signup"
                                onSuccess={handleAuthSuccess}
                                className="w-full max-w-sm mx-auto"
                            />
                        ) : isLoadingProgram ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Cargando programa...
                            </p>
                        ) : !program ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No encontramos este programa o ya no está disponible.
                            </p>
                        ) : (
                            <>
                                <div className="w-full">
                                    <div className="mx-auto w-full max-w-md px-4">
                                        <MembershipCardPreview
                                            membership={{
                                                id: 'preview',
                                                program_id: program.id,
                                                user_id: '',
                                                membership_client_id: '',
                                                balance: 0,
                                                created_at: '',
                                                public_id: '',
                                                business: program.business,
                                                program:
                                                    program as MembershipWithProgram['program'],
                                            }}
                                            index={0}
                                        />
                                    </div>
                                </div>

                                {hasMembership ? (
                                    <p className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                                        Ya tienes esta tarjeta en tu cuenta
                                    </p>
                                ) : (
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={handleReject}
                                            disabled={joinMutation.isPending}
                                            className="min-h-12 flex-1 py-4 text-muted-foreground"
                                        >
                                            Rechazar
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="min-h-12 flex-1 py-4"
                                            onClick={handleJoin}
                                            disabled={joinMutation.isPending}
                                        >
                                            {joinMutation.isPending ? 'Agregando...' : 'Unirse'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 rounded-xl overflow-hidden bg-black/5 dark:bg-black/20">
                        <div
                            id={SCANNER_ELEMENT_ID}
                            className="w-full h-full min-h-[300px] [&>div]:rounded-xl"
                        />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
