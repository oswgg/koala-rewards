'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/shared/components/auth-form';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { businessRoutes } from '@/shared/lib/routes';
import { NewCustomerSection } from '@/modules/business/scan/components/new-customer-section/new-customer-section';
import { ActivityByPhoneFlow } from '@/modules/business/scan/components/activity-by-phone-flow';
import { ActivityByQrFlow } from '@/modules/business/scan/components/activity-by-qr-flow';
import { ActivityMethodSection } from '@/modules/business/scan/components/activity-method-section';
import { SelectingActionSection } from '@/modules/business/scan/components/selecting-action-section';

type Action =
    | 'selecting'
    | 'new-customer'
    | 'activity-method'
    | 'activity-by-qr'
    | 'activity-by-phone';

function ScanPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading: authLoading } = useAuthSession();
    const [action, setAction] = useState<Action>('selecting');

    const hasUrlQrPayload = useMemo(() => {
        const p = searchParams.get('p');
        const u = searchParams.get('u');
        return !!(p && u);
    }, [searchParams]);

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

    if (action === 'selecting') {
        return <SelectingActionSection onSelectAction={setAction} />;
    }

    if (action === 'new-customer') {
        return (
            <NewCustomerSection
                onRegisterVisit={() => setAction('activity-method')}
                onCancel={() => setAction('selecting')}
            />
        );
    }

    if (action === 'activity-method') {
        return (
            <ActivityMethodSection
                onSelectQr={() => setAction('activity-by-qr')}
                onSelectPhone={() => setAction('activity-by-phone')}
                onBack={() => setAction('selecting')}
            />
        );
    }

    /** QR: escáner o resultado; también enlaces `?p=&u=` aunque el menú siga en “selecting”. */
    if (action === 'activity-by-qr' || hasUrlQrPayload) {
        return (
            <ActivityByQrFlow
                scannerMode={action === 'activity-by-qr'}
                onBack={() => setAction('activity-method')}
                onCancel={() => setAction('selecting')}
            />
        );
    }

    if (action === 'activity-by-phone') {
        return (
            <div className="fixed inset-0 z-40 flex min-h-0 flex-col overflow-hidden bg-background">
                <ActivityByPhoneFlow
                    onBack={() => setAction('activity-method')}
                    onCancel={() => setAction('selecting')}
                />
            </div>
        );
    }

    return null;
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
