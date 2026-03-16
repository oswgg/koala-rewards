'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Stamp, ScanLine, Gift, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field';
import { MembershipCardPreview } from '@/shared/components/wallets/membership-card-preview';
import { useMembershipByClientId } from '../hooks/useMembershipByClientId';
import { useRegisterActivity } from '../hooks/useRegisterActivity';
import { useRedeemReward } from '../hooks/useRedeemReward';
import { useStaff } from '../hooks/useStaff';
import { isRewardReady } from '@/shared/lib/reward';
import { businessRoutes } from '@/shared/lib/routes';

interface ScanActivityFormProps {
    membershipClientId: string;
    programId: string;
    userId: string;
    onScanAnother?: () => void;
}

export function ScanActivityForm({
    membershipClientId,
    programId,
    userId,
    onScanAnother,
}: ScanActivityFormProps) {
    const [purchaseAmount, setPurchaseAmount] = useState('');

    const {
        data: membership,
        isLoading,
        isError,
    } = useMembershipByClientId(membershipClientId, programId, userId);

    const { data: staff, isLoading: staffLoading } = useStaff();
    const registerMutation = useRegisterActivity();
    const redeemMutation = useRedeemReward();

    const handleRegisterStamp = () => {
        if (!membership || !staff) return;
        const amount = parseFloat(purchaseAmount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) return;
        registerMutation.mutate(
            {
                input: {
                    type: 'earn',
                    programType: 'stamps',
                    membershipId: membership.id,
                    programId: membership.program_id,
                    quantity: 1,
                    purchaseAmount: amount,
                },
                staffId: staff.id,
            },
            { onSuccess: () => setPurchaseAmount('') }
        );
    };

    const handleRegisterPurchase = () => {
        if (!membership || !staff) return;
        const amount = parseFloat(purchaseAmount.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) return;
        registerMutation.mutate(
            {
                input: {
                    type: 'earn',
                    programType: membership.program.type as 'points' | 'cashback',
                    membershipId: membership.id,
                    programId: membership.program_id,
                    quantity: 1,
                    purchaseAmount: amount,
                },
                staffId: staff.id,
            },
            { onSuccess: () => setPurchaseAmount('') }
        );
    };

    const handleRedeemReward = () => {
        if (!membership || !staff) return;
        redeemMutation.mutate({
            input: {
                type: 'redeem',
                programType: null,
                membershipId: membership.id,
                programId: membership.program_id,
            },
            staffId: staff.id,
        });
    };

    if (isLoading || staffLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (isError || !membership) {
        return (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                No encontramos esta tarjeta. Verifica que el código escaneado sea correcto.
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-center text-amber-700 dark:text-amber-400">
                Debes iniciar sesión como staff de un negocio para registrar actividades.
            </div>
        );
    }

    const program = membership.program;
    const earnSuccess = registerMutation.isSuccess && !registerMutation.isPending;
    const redeemSuccess = redeemMutation.isSuccess && !redeemMutation.isPending;
    const earnResult = registerMutation.data;
    const redeemResult = redeemMutation.data;

    const displayBalance = redeemResult?.newBalance ?? earnResult?.newBalance ?? membership.balance;
    const rewardReady =
        (program.type === 'stamps' || program.type === 'points') &&
        isRewardReady(program, displayBalance);

    const formatEarned = () => {
        if (!earnResult) return null;
        const { earnedAmount } = earnResult;
        if (program.type === 'stamps')
            return `+${earnedAmount} sello${earnedAmount !== 1 ? 's' : ''}`;
        if (program.type === 'points') return `+${earnedAmount} puntos`;
        if (program.type === 'cashback') return `+${earnedAmount.toFixed(2)} $`;
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="mx-auto w-full max-w-md px-1">
                <MembershipCardPreview
                    membership={{ ...membership, balance: displayBalance }}
                    index={0}
                />
            </div>

            <div className="space-y-4">
                {rewardReady ? (
                    <div className="space-y-2">
                        <p className="text-center text-sm text-muted-foreground">
                            El cliente tiene saldo suficiente para canjear su recompensa. No se
                            puede registrar visita ni venta hasta que canjee.
                        </p>
                        <Button
                            size="lg"
                            className="w-full"
                            onClick={handleRedeemReward}
                            disabled={redeemMutation.isPending}
                        >
                            <Gift className="mr-2 size-5" />
                            {redeemMutation.isPending ? 'Otorgando...' : 'Otorgar recompensa'}
                        </Button>
                    </div>
                ) : (
                    <>
                        {program.type === 'stamps' && (
                            <FieldGroup>
                                <FieldLabel>Importe de la venta ($)</FieldLabel>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={purchaseAmount}
                                    onChange={(e) => setPurchaseAmount(e.target.value)}
                                />
                                <FieldDescription>
                                    Se registrará 1 sello y el monto de la venta
                                </FieldDescription>
                                <Button
                                    size="lg"
                                    onClick={handleRegisterStamp}
                                    disabled={
                                        registerMutation.isPending ||
                                        !purchaseAmount ||
                                        isNaN(parseFloat(purchaseAmount.replace(',', '.'))) ||
                                        parseFloat(purchaseAmount.replace(',', '.')) <= 0
                                    }
                                    className="mt-2 w-full"
                                >
                                    <Stamp className="mr-2 size-5" />
                                    {registerMutation.isPending
                                        ? 'Registrando...'
                                        : 'Registrar visita (1 sello)'}
                                </Button>
                            </FieldGroup>
                        )}

                        {(program.type === 'points' || program.type === 'cashback') && (
                            <FieldGroup>
                                <FieldLabel>Importe de la venta ($)</FieldLabel>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    value={purchaseAmount}
                                    onChange={(e) => setPurchaseAmount(e.target.value)}
                                />
                                <FieldDescription>
                                    Se calcularán los puntos o cashback según el programa
                                </FieldDescription>
                                <Button
                                    size="lg"
                                    onClick={handleRegisterPurchase}
                                    disabled={
                                        registerMutation.isPending ||
                                        !purchaseAmount ||
                                        isNaN(parseFloat(purchaseAmount.replace(',', '.'))) ||
                                        parseFloat(purchaseAmount.replace(',', '.')) <= 0
                                    }
                                    className="mt-2 w-full"
                                >
                                    <DollarSign className="mr-2 size-5" />
                                    {registerMutation.isPending
                                        ? 'Registrando...'
                                        : 'Registrar compra'}
                                </Button>
                            </FieldGroup>
                        )}
                    </>
                )}
            </div>

            {earnSuccess && earnResult && (
                <div className="space-y-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    <p className="font-medium">¡Actividad registrada correctamente!</p>
                    <p>
                        {formatEarned()} · Nuevo saldo:{' '}
                        {program.type === 'cashback'
                            ? `${earnResult.newBalance.toFixed(2)} $`
                            : program.type === 'stamps'
                              ? `${earnResult.newBalance} / ${program.reward_cost} sellos`
                              : `${earnResult.newBalance} puntos`}
                    </p>
                </div>
            )}

            {redeemSuccess && redeemResult && (
                <div className="space-y-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    <p className="font-medium">¡Recompensa otorgada correctamente!</p>
                    <p>
                        Nuevo saldo:{' '}
                        {program.type === 'stamps'
                            ? `${redeemResult.newBalance} / ${program.reward_cost} sellos`
                            : `${redeemResult.newBalance} puntos`}
                    </p>
                </div>
            )}

            {onScanAnother ? (
                <button
                    type="button"
                    onClick={onScanAnother}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ScanLine className="size-4" />
                    Escanear otra tarjeta
                </button>
            ) : (
                <Link
                    href={businessRoutes.scan}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ScanLine className="size-4" />
                    Escanear otra tarjeta
                </Link>
            )}
        </div>
    );
}
