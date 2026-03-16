'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { typeConfig } from '@/shared/components/wallets/mermbership-card-detail';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';

interface JoinProgramDetailsProps {
    program: StoredLoyaltyProgram;
    onAccept: () => void;
    isPending?: boolean;
    alreadyMember?: boolean;
}

function StampGrid({ total }: { total: number }) {
    const cols = Math.min(total, 5);
    return (
        <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-full border border-muted-foreground/30 bg-muted/30"
                >
                    <Star className="size-4 fill-muted text-muted-foreground/50" />
                </div>
            ))}
        </div>
    );
}

export function JoinProgramDetails({
    program,
    onAccept,
    isPending = false,
    alreadyMember = false,
}: JoinProgramDetailsProps) {
    const typeLabel = typeConfig[program.type].label;
    const stampCount = program.type === 'stamps' ? (program.reward_cost ?? 10) : 10;

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {typeLabel}
                </p>
                <CardTitle className="text-xl">{program.name}</CardTitle>
                <CardDescription className="text-base">
                    {program.reward_description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {program.type === 'stamps' && (
                    <div>
                        <p className="mb-2 text-sm font-medium text-foreground">
                            Sellos para canjear
                        </p>
                        <StampGrid total={stampCount} />
                        <p className="mt-2 text-sm text-muted-foreground">
                            Necesitas {stampCount} sellos para obtener tu recompensa
                        </p>
                    </div>
                )}

                {program.type === 'points' && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">
                            {program.points_percentage}% por cada $ gastado
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Canjea a partir de {program.reward_cost} puntos
                        </p>
                    </div>
                )}

                {program.type === 'cashback' && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-sm font-medium text-foreground">
                            {program.cashback_percentage}% de cashback
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">Acumula en cada compra</p>
                    </div>
                )}

                {program.limit_one_per_day && (
                    <p className="text-xs text-muted-foreground">Límite de un canje por día</p>
                )}

                {alreadyMember ? (
                    <div className="space-y-3">
                        <p className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                            Ya tienes esta tarjeta en tu cuenta
                        </p>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/">Ir a inicio</Link>
                        </Button>
                    </div>
                ) : (
                    <Button className="w-full" size="lg" onClick={onAccept} disabled={isPending}>
                        {isPending ? 'Agregando...' : 'Agregar tarjeta a mi cuenta'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
