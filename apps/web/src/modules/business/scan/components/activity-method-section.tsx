import { Button } from '@/shared/components/ui/button';
import { Phone, QrCode } from 'lucide-react';

interface ActivityMethodSectionProps {
    onSelectQr: () => void;
    onSelectPhone: () => void;
    onBack: () => void;
}

export function ActivityMethodSection({
    onSelectQr,
    onSelectPhone,
    onBack,
}: ActivityMethodSectionProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="shrink-0 border-b border-border bg-card px-4 py-4">
                <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
                        Cancelar
                    </Button>
                </div>
                <h1 className="mt-2 text-lg font-semibold text-foreground">Registrar actividad</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Elige cómo identificar al cliente
                </p>
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
                <Button
                    type="button"
                    onClick={onSelectQr}
                    variant="outline"
                    className="flex flex-col items-center gap-4 p-12"
                >
                    <QrCode className="size-6" aria-hidden />
                    <p className="text-lg font-medium">Código QR</p>
                </Button>
                <Button
                    type="button"
                    onClick={onSelectPhone}
                    variant="outline"
                    className="flex flex-col items-center gap-4 p-12"
                >
                    <Phone className="size-6" aria-hidden />
                    <p className="text-lg font-medium">Número de teléfono</p>
                </Button>
            </main>
        </div>
    );
}
