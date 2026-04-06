'use client';

import { useMembershipSync } from '../hooks/useMembershipSync';

export function MembershipSyncProvider({ children }: { children: React.ReactNode }) {
    useMembershipSync();
    return <>{children}</>;
}
