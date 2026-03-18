'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { CustomerWalletView } from '@/modules/memberships/components/customer-wallet-view';
import { parseProgramQR } from '@/shared/lib/qr-data';
import { customerRoutes } from '@/shared/lib/routes';

function PageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const jParam = searchParams.get('j');

    const initialJoinData = useMemo(() => {
        if (!jParam) return null;
        return parseProgramQR(jParam);
    }, [jParam]);

    const handleJoinModalCloseFromUrl = useCallback(() => {
        router.replace(customerRoutes.app);
    }, [router]);

    return (
        <CustomerWalletView
            initialJoinData={initialJoinData}
            onJoinModalCloseFromUrl={handleJoinModalCloseFromUrl}
        />
    );
}

export default function Page() {
    return (
        <Suspense fallback={<CustomerWalletView />}>
            <PageContent />
        </Suspense>
    );
}
