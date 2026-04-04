'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@koalacards/shared/ui';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import {
    MemberShipCardDetailView,
    typeConfig,
} from '@/shared/components/wallets/mermbership-card-detail';
import { buildProgramJoinUrl, getCardTheme, StoredLoyaltyProgram } from '@koalacards/loyalty';

export { typeConfig };

export function ProgramCardPreview({
    program,
    className,
}: {
    program: StoredLoyaltyProgram;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);
    const status = program.is_active ? 'Activo' : 'Borrador';
    const statusColor = program.is_active ? 'bg-emerald-500' : 'bg-amber-400';
    const base = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const joinUrl = buildProgramJoinUrl(base, program);
    const theme = getCardTheme(program.card_theme);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    return (
        <div className={cn('flex flex-col items-center gap-2', className)}>
            <Link
                href={`/business/programs/${program.id}`}
                className="block w-full overflow-hidden rounded-3xl shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
                <MemberShipCardDetailView
                    businessName={program.business.name}
                    programName={program.name}
                    programType={program.type}
                    rewardDescription={program.reward_description}
                    rewardCost={program.reward_cost ?? 0}
                    cashbackPercentage={program.cashback_percentage ?? 0}
                    pointsPercentage={program.points_percentage ?? 0}
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
        <div className="min-w-90 animate-pulse rounded-xl border border-border bg-muted/30 aspect-3/4">
            <div className="flex flex-1 flex-col overflow-hidden p-4 animate-pulse">
                <div className="w-24 h-4 bg-muted-foreground/20 rounded-sm" />
                <div className="w-16 h-4 bg-muted-foreground/20 rounded-sm mt-2" />
                <div className="w-full h-24 bg-muted-foreground/20 rounded-sm mt-4" />
                <div className="w-48 mx-auto aspect-square rounded-sm mt-4 bg-muted-foreground/20" />
            </div>
        </div>
    );
}
