'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { AuthForm } from '@/shared/components/auth-form';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { ScanActivityForm } from '@/modules/activities/components/scan-activity-form';
import { parseCustomerQR, type CustomerQRData } from '@/shared/lib/qr-data';
import { businessRoutes } from '@/shared/lib/routes';

const SCANNER_ELEMENT_ID = 'scan-membership-qr';

export default function ScanPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuthSession();
    const [scannedData, setScannedData] = useState<CustomerQRData | null>(null);

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
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (!mounted || processedRef.current) return;
                        const data = parseCustomerQR(decodedText);
                        console.log({ data });
                        if (data) {
                            processedRef.current = true;
                            stopScanner();
                            setScannedData(data);
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
        setScannedData(null);
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
                            membershipClientId={scannedData.membership_client_id}
                            programId={scannedData.program_id}
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
            <div className="flex-1 overflow-hidden p-4">
                <div
                    id={SCANNER_ELEMENT_ID}
                    className="h-full min-h-[300px] w-full overflow-hidden rounded-xl bg-black/5 [&>div]:rounded-xl dark:bg-black/20"
                />
            </div>
        </div>
    );
}
