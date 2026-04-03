'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Barra superior pegajosa: mismo patrón en flujos de scan (QR, teléfono, registro cliente).
 */
export function ScanFlowStickyHeader({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'sticky bg-background top-0 z-100 border-b px-4 py-3 shadow-sm md:px-6',
                className
            )}
        >
            <div className="mx-auto w-full max-w-md space-y-3">{children}</div>
        </div>
    );
}
