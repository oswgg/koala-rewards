'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

import { authRepository } from '@/infrastructure';

import { ScanActivityForm } from './scan-activity-form';
import { ScanFlowStickyHeader } from './scan-flow-sticky-header';

import { Button, cn } from '@vado/shared/ui';
import { CustomerQRData, parseCustomerQR } from '@vado/loyalty';
import { scannerPortalRoutes } from '@vado/loyalty/ui';
import { useUser } from '@vado/shared/hooks';

const SCANNER_ELEMENT_ID = 'scan-membership-qr';

export interface ActivityByQrFlowProps {
    /** `true` cuando el usuario eligió “Código QR” y debe mostrarse la cámara (si aún no hay lectura). */
    scannerMode: boolean;
    onBack: () => void;
    onCancel: () => void;
}

export function ActivityByQrFlow({ scannerMode, onBack, onCancel }: ActivityByQrFlowProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useUser({ authRepository });

    const queryData = useMemo(() => {
        const p = searchParams.get('p');
        const u = searchParams.get('u');
        if (p && u) return { program_public_id: p, profile_id: u } satisfies CustomerQRData;
        return null;
    }, [searchParams]);

    const [persistedScan, setPersistedScan] = useState<CustomerQRData | null>(null);
    const scannedData = persistedScan ?? queryData;

    useEffect(() => {
        if (queryData) {
            setPersistedScan(queryData);
            router.replace(scannerPortalRoutes.app, { scroll: false });
        }
    }, [queryData, router]);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScanningRef = useRef(false);
    const processedRef = useRef(false);

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

    useEffect(() => {
        if (!user || authLoading || scannedData) return;
        if (!scannerMode) return;

        processedRef.current = false;
        let mounted = true;

        const startScanner = async () => {
            await new Promise((r) => setTimeout(r, 100));
            if (!mounted || !document.getElementById(SCANNER_ELEMENT_ID)) return;

            try {
                const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 15,
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
                            const edge = Math.min(viewfinderWidth, viewfinderHeight);
                            const size = Math.max(180, Math.min(Math.floor(edge * 0.72), 340));
                            return { width: size, height: size };
                        },
                        disableFlip: true,
                    },
                    (decodedText) => {
                        if (!mounted || processedRef.current) return;
                        const data = parseCustomerQR(decodedText);
                        if (data) {
                            processedRef.current = true;
                            stopScanner();
                            setPersistedScan(data);
                        }
                    },
                    () => {}
                );
                isScanningRef.current = true;
            } catch (err) {
                console.error('Error starting QR scanner:', err);
            }
        };

        startScanner();
        return () => {
            mounted = false;
            stopScanner();
        };
    }, [user, authLoading, scannedData, stopScanner, scannerMode]);

    const handleScanAnother = useCallback(() => {
        setPersistedScan(null);
        router.replace(scannerPortalRoutes.app);
    }, [router]);

    if (scannedData) {
        return (
            <div className="flex min-h-svh flex-1 flex-col overflow-hidden bg-background">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <ScanFlowStickyHeader>
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                        <div className="space-y-1 text-left">
                            <h1 className="text-lg font-semibold text-foreground">
                                Registrar actividad
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Marca una visita o venta en la tarjeta del cliente
                            </p>
                        </div>
                    </ScanFlowStickyHeader>
                    <main className="flex-1 p-4 pb-8">
                        <div className="mx-auto max-w-md">
                            <ScanActivityForm
                                programPublicId={scannedData.program_public_id}
                                profileId={scannedData.profile_id}
                                onScanAnother={handleScanAnother}
                            />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (scannerMode) {
        return (
            <div className="flex min-h-svh flex-1 flex-col overflow-hidden bg-background">
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                    <ScanFlowStickyHeader>
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                                Atrás
                            </Button>
                        </div>
                        <div className="space-y-1 text-left">
                            <h1 className="text-lg font-semibold text-foreground">
                                Escanear tarjeta del cliente
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Apunta la cámara al código QR de la tarjeta de fidelidad del cliente
                            </p>
                        </div>
                    </ScanFlowStickyHeader>
                    <div className="flex flex-1 flex-col px-4 pb-8 pt-4">
                        <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg">
                            <div
                                id={SCANNER_ELEMENT_ID}
                                className={cn(
                                    'relative aspect-square w-full overflow-hidden rounded-xl bg-black',
                                    '[&_video]:block [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover'
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
