'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, WifiOff } from 'lucide-react';

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
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useProgramByPublicId } from '@/modules/programs/hooks/useProgramByPublicId';
import { useJoinProgram } from '@/modules/memberships/hooks/useJoinProgram';
import { useHasMembership } from '@/modules/memberships/hooks/useHasMembership';
import { useOfflineMemberships } from '@/modules/memberships/hooks/useOfflineMemberships';
import { parseProgramQRParams, type ProgramQRData } from '@/shared/lib/qr-data';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

const SCANNER_ELEMENT_ID = 'join-program-qr-scanner';

interface ScannedQRResult {
    programPublicId: string;
    offlineData: ProgramQRData | null;
}

function extractFromQRUrl(text: string): ScannedQRResult | null {
    try {
        let url: URL | null = null;
        if (text.startsWith('http://') || text.startsWith('https://')) {
            url = new URL(text);
        }

        const pathname = url ? url.pathname : text;
        const match = pathname.match(/^\/join\/([^/?#]+)/);
        if (!match) return null;

        const programPublicId = match[1];
        const searchParams = url?.searchParams ?? new URLSearchParams();
        const offlineData = parseProgramQRParams(searchParams);

        return { programPublicId, offlineData };
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
    const [scannedResult, setScannedResult] = useState<ScannedQRResult | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);
    const processedRef = useRef(false);

    const { isAuthenticated, isLoading: authLoading, user } = useAuthSession();
    const { isOnline } = useNetworkStatus();
    const {
        program,
        isLoading: programLoading,
        isError: programError,
    } = useProgramByPublicId(isOnline ? (scannedResult?.programPublicId ?? undefined) : undefined);
    const { hasMembership, isLoading: membershipLoading } = useHasMembership(program?.id, user?.id);
    const joinMutation = useJoinProgram();
    const { createLocalMembership } = useOfflineMemberships();

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
        const result = extractFromQRUrl(decodedText);
        if (result) {
            processedRef.current = true;
            stopScanner();
            setScannedResult(result);
        }
    });
    handleScanSuccessRef.current = (decodedText: string) => {
        if (processedRef.current) return;
        const result = extractFromQRUrl(decodedText);
        if (result) {
            processedRef.current = true;
            stopScanner();
            setScannedResult(result);
        }
    };

    const handleClose = useCallback(() => {
        setScannedResult(null);
        processedRef.current = false;
        onOpenChange(false);
    }, [onOpenChange]);

    const handleReject = useCallback(() => {
        setScannedResult(null);
        onOpenChange(false);
        processedRef.current = false;
    }, [onOpenChange]);

    const handleJoin = useCallback(async () => {
        if (!user?.id) return;

        const membershipClientId = crypto.randomUUID();

        if (isOnline && program) {
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
        } else if (scannedResult?.offlineData) {
            const data = scannedResult.offlineData;
            await createLocalMembership({
                user_id: user?.id,
                membership_client_id: membershipClientId,
                program_id: scannedResult.programPublicId,
                business_id: data.business_id,
                program_name: data.program_name,
                program_type: data.program_type,
                required_quantity: data.required_quantity,
            });
            handleClose();
        }
    }, [
        program,
        user?.id,
        isOnline,
        scannedResult,
        joinMutation,
        createLocalMembership,
        handleClose,
        onJoinSuccess,
    ]);

    const handleAuthSuccess = useCallback(() => {
        // After login, user is authenticated; preview will show automatically
    }, []);

    useEffect(() => {
        if (!open) {
            processedRef.current = false;
            setScannedResult(null);
            stopScanner();
            return;
        }

        processedRef.current = false;
        setScannedResult(null);
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

    const showPreview = scannedResult !== null;
    const hasOfflineData = !!scannedResult?.offlineData;
    const canJoinOffline = !isOnline && hasOfflineData;

    const offlinePreviewProgram = scannedResult?.offlineData
        ? {
              id: scannedResult.programPublicId,
              business_id: scannedResult.offlineData.business_id,
              public_id: scannedResult.programPublicId,
              created_at: '',
              is_active: true as const,
              name: scannedResult.offlineData.program_name,
              reward_description: '',
              limit_one_per_day: false,
              type: scannedResult.offlineData.program_type,
              reward_cost: scannedResult.offlineData.required_quantity,
              points_percentage: null,
              cashback_percentage: null,
              business: {
                  id: scannedResult.offlineData.business_id,
                  name: '',
                  slug: '',
                  created_at: '',
              },
          }
        : null;

    const displayProgram = program ?? offlinePreviewProgram;
    const isLoadingProgram = isOnline && (programLoading || membershipLoading);

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
                        ) : !isAuthenticated && isOnline ? (
                            <AuthForm
                                type="signup"
                                onSuccess={handleAuthSuccess}
                                className="w-full max-w-sm mx-auto"
                            />
                        ) : isLoadingProgram ? (
                            <p className="py-8 text-center text-muted-foreground">
                                Cargando programa...
                            </p>
                        ) : !displayProgram ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No encontramos este programa o ya no está disponible.
                            </p>
                        ) : (
                            <>
                                {canJoinOffline && (
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                                        <WifiOff className="size-4 shrink-0" />
                                        <p>
                                            Sin conexión. La tarjeta se guardará localmente y se
                                            sincronizará cuando tengas internet.
                                        </p>
                                    </div>
                                )}

                                <div className="w-full">
                                    <div className="mx-auto w-full max-w-md px-4">
                                        <MembershipCardPreview
                                            membership={{
                                                id: 'preview',
                                                program_id: displayProgram.id,
                                                user_id: '',
                                                membership_client_id: '',
                                                balance: 0,
                                                created_at: '',
                                                public_id: '',
                                                business: displayProgram.business,
                                                program:
                                                    displayProgram as MembershipWithProgram['program'],
                                            }}
                                            index={0}
                                        />
                                    </div>
                                </div>

                                {isOnline && hasMembership ? (
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
