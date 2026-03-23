import { NewCustomerForm } from './new-customer-form';

type NewCustomerSectionProps = {
    onRegisterVisit: () => void;
};

export function NewCustomerSection({ onRegisterVisit }: NewCustomerSectionProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="shrink-0 border-b border-border bg-card px-4 py-3 md:py-4">
                <h1 className="text-base font-semibold text-foreground md:text-lg">
                    Registrar cliente
                </h1>
            </header>
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <NewCustomerForm onRegisterVisit={onRegisterVisit} />
            </main>
        </div>
    );
}
