'use client';

import { Suspense, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { AuthForm } from '@/shared/components/auth-form';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { ScanActivityForm } from '@/modules/activities/components/scan-activity-form';
import { parseCustomerQR, type CustomerQRData } from '@/shared/lib/qr-data';
import { businessRoutes } from '@/shared/lib/routes';
import { cn } from '@/shared/lib/utils';

const SCANNER_ELEMENT_ID = 'scan-membership-qr';

function ScanPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading } = useAuthSession();

    const queryData = useMemo(() => {
        const p = searchParams.get('p');
        const u = searchParams.get('u');
        if (p && u) return { program_public_id: p, user_id: u } satisfies CustomerQRData;
        return null;
    }, [searchParams]);

    const [persistedScan, setPersistedScan] = useState<CustomerQRData | null>(null);
    const scannedData = persistedScan ?? queryData;

    useEffect(() => {
        if (queryData) {
            setPersistedScan(queryData);
            router.replace(businessRoutes.scan, { scroll: false });
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
        if (!isAuthenticated || authLoading || scannedData) return;

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
    }, [isAuthenticated, authLoading, scannedData, stopScanner]);

    const handleScanAnother = useCallback(() => {
        setPersistedScan(null);
        router.replace(businessRoutes.scan);
    }, [router]);

    if (!isAuthenticated && !authLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 pt-24">
                <div className="w-full max-w-sm">
                    <AuthForm type="signup" onSuccess={() => router.push(businessRoutes.scan)} />
                </div>
            </div>
        );
    }

    if (authLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center bg-background">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (scannedData) {
        return (
            <div className="flex min-h-svh flex-col bg-background">
                <header className="shrink-0 border-b border-border bg-card px-4 py-4">
                    <h1 className="text-lg font-semibold text-foreground">Registrar actividad</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Marca una visita o venta en la tarjeta del cliente
                    </p>
                </header>
                <main className="flex-1 overflow-auto p-4">
                    <div className="mx-auto max-w-md">
                        <ScanActivityForm
                            programPublicId={scannedData.program_public_id}
                            userId={scannedData.user_id}
                            onScanAnother={handleScanAnother}
                        />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="shrink-0 border-b border-border bg-card px-4 py-4">
                <h1 className="text-lg font-semibold text-foreground">
                    Escanear tarjeta del cliente
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Apunta la cámara al código QR de la tarjeta de fidelidad del cliente
                </p>
            </header>
            <div className="flex flex-1 flex-col overflow-auto px-4 pb-8 pt-4">
                <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg">
                    <div
                        id={SCANNER_ELEMENT_ID}
                        className={cn(
                            'relative aspect-square w-full overflow-hidden rounded-xl bg-black',
                            /* html5-qrcode fija ancho al vídeo; forzamos llenar el cuadrado para evitar bandas claras */
                            '[&_video]:block [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover'
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ScanPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-svh flex-col items-center justify-center bg-background">
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            }
        >
            <ScanPageContent />
        </Suspense>
    );
}
