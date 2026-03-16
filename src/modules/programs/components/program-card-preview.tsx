'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import Link from 'next/link';
import {
    MemberShipCardDetailView,
    CARD_THEMES,
    typeConfig,
} from '@/shared/components/wallets/mermbership-card-detail';
import { buildProgramJoinUrl } from '@/shared/lib/qr-data';

export { typeConfig };

const CARD_WIDTH = 260;
const CARD_ASPECT = 1 / 1.3; // Vertical, menos alto que tarjeta de banco

export function ProgramCardPreview({
    program,
    index = 0,
    className,
}: {
    program: StoredLoyaltyProgram;
    index?: number;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);
    const status = program.is_active ? 'Activo' : 'Borrador';
    const statusColor = program.is_active ? 'bg-emerald-500' : 'bg-amber-400';
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const joinUrl = buildProgramJoinUrl(base, program);
    const theme = CARD_THEMES[index % CARD_THEMES.length];

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback para navegadores sin clipboard API
        }
    };

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <Link
                href={`/business/programs/${program.id}`}
                className="block w-[320px] overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
                <MemberShipCardDetailView
                    program={program}
                    balance={0}
                    qrUrl={joinUrl}
                    theme={theme}
                    variant="business"
                    size="lg"
                />
            </Link>

            <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
                <span className={cn('size-1.5 rounded-full', statusColor)} aria-hidden />
                <span className="text-xs text-muted-foreground">{status}</span>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={(e) => {
                    e.preventDefault();
                    handleCopyLink();
                }}
            >
                <Copy className="size-3.5" />
                {copied ? '¡Copiado!' : 'Copiar enlace'}
            </Button>
        </div>
    );
}

export function ProgramCardPreviewSkeleton() {
    return (
        <div
            style={{
                width: CARD_WIDTH,
                aspectRatio: CARD_ASPECT,
            }}
            className="animate-pulse rounded-xl border border-border bg-muted/30"
        >
            <div className="flex flex-1 flex-col overflow-hidden p-4 animate-pulse">
                <div className="w-24 h-4 bg-muted-foreground/20 rounded-sm "></div>
                <div className="w-16 h-4 bg-muted-foreground/20 rounded-sm mt-2"></div>
                <div className="w-full h-24 bg-muted-foreground/20 rounded-sm mt-4"></div>
                <div className="w-24 mx-auto aspect-square rounded-sm mt-4 bg-muted-foreground/20"></div>
            </div>
        </div>
    );
}
