'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@vado/shared/ui';
import { JoinProgramQRData, parseProgramQR } from '@vado/loyalty';

const SCANNER_ELEMENT_ID = 'join-program-qr-scanner';

export interface JoinProgramScannerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScanSuccess: (data: JoinProgramQRData) => void;
}

export function JoinProgramScanner({ open, onOpenChange, onScanSuccess }: JoinProgramScannerProps) {
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

    const handleScanSuccessRef = useRef((decodedText: string) => {
        if (processedRef.current) return;
        const data = parseProgramQR(decodedText);
        if (data?.programPublicId) {
            processedRef.current = true;
            stopScanner();
            onOpenChange(false);
            onScanSuccess(data);
        }
    });

    handleScanSuccessRef.current = (decodedText: string) => {
        if (processedRef.current) return;
        const data = parseProgramQR(decodedText);
        if (data?.programPublicId) {
            processedRef.current = true;
            stopScanner();
            onOpenChange(false);
            onScanSuccess(data);
        }
    };

    const handleClose = useCallback(() => {
        processedRef.current = false;
        onOpenChange(false);
    }, [onOpenChange]);

    useEffect(() => {
        if (!open) {
            processedRef.current = false;
            stopScanner();
            return;
        }

        processedRef.current = false;
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
                    {
                        fps: 15,
                        qrbox: { width: 250, height: 250 },
                        disableFlip: true,
                    },
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

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                showCloseButton={false}
                className="h-[90vh] flex flex-col gap-4 overflow-y-auto overflow-x-hidden"
            >
                <SheetHeader className="flex flex-row items-center justify-between space-y-0 shrink-0">
                    <div>
                        <SheetTitle>Escanear código QR</SheetTitle>
                        <SheetDescription>
                            Apunta la cámara al código QR del programa para unirte
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

                <div className="flex-1 min-h-0 rounded-xl overflow-hidden bg-black/5 dark:bg-black/20">
                    <div
                        id={SCANNER_ELEMENT_ID}
                        className="w-full h-full min-h-75 [&>div]:rounded-xl"
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
