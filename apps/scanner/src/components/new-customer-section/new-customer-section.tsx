import { NewCustomerForm } from './new-customer-form';

type NewCustomerSectionProps = {
    onRegisterVisit: () => void;
    onCancel: () => void;
};

export function NewCustomerSection({ onRegisterVisit, onCancel }: NewCustomerSectionProps) {
    return (
        <div className="flex min-h-svh flex-col bg-background">
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <NewCustomerForm onRegisterVisit={onRegisterVisit} onCancel={onCancel} />
            </main>
        </div>
    );
}
