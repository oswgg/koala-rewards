import { Button } from '@/shared/components/ui/button';
import { QrCode, UserPlus } from 'lucide-react';

interface SelectingActionSectionProps {
    onSelectAction: (action: 'new-customer' | 'activity-method') => void;
}

export function SelectingActionSection({ onSelectAction }: SelectingActionSectionProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="shrink-0 border-b border-border bg-card px-4 py-4">
                <h1 className="text-lg font-semibold text-foreground">
                    Escanear tarjeta del cliente
                </h1>
            </header>
            <main className="flex-1 flex flex-col gap-4 overflow-auto p-4">
                <Button
                    onClick={() => onSelectAction('new-customer')}
                    variant="outline"
                    className="flex flex-col items-center gap-4 p-12"
                >
                    <UserPlus className="size-6" />
                    <p className="text-lg font-medium">Registrar Cliente</p>
                </Button>
                <Button
                    onClick={() => onSelectAction('activity-method')}
                    variant="outline"
                    className="flex flex-col items-center gap-4 p-12"
                >
                    <QrCode className="size-6" />
                    <p className="text-lg font-medium">Registrar actividad</p>
                </Button>
            </main>
        </div>
    );
}
