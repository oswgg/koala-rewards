'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Stamp, ScanLine, Gift, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FieldDescription, FieldGroup, FieldLabel } from '@/shared/components/ui/field';
import { MembershipCardPreview } from '@/shared/components/wallets/membership-card-preview';
import { useMembershipByClientId } from '../hooks/useMembershipByClientId';
import { useRegisterActivity } from '../hooks/useRegisterActivity';
import { useRedeemReward } from '../hooks/useRedeemReward';
import { useStaff } from '../hooks/useStaff';
import { useEarnLimitToday } from '../hooks/useEarnLimitToday';
import {
    EARN_PER_DAY_LIMIT_MESSAGE,
    parseRegisterEarnError,
    RegisterEarnErrorType,
} from '@/modules/activities/lib/register-activity-errors';
import { isRewardReady } from '@/shared/lib/reward';
import { businessRoutes } from '@/shared/lib/routes';
import { calculateEarnedAmount } from '../domain/balance';

interface ScanActivityFormProps {
    programPublicId: string;
    userId: string;
    onScanAnother?: () => void;
}

export function ScanActivityForm({
    programPublicId,
    userId,
    onScanAnother,
}: ScanActivityFormProps) {
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [cashbackApplyError, setCashbackApplyError] = useState<string | null>(null);
    const [isApplyingCashback, setIsApplyingCashback] = useState(false);
    const lastCashbackApplyTotalsRef = useRef<{
        totalCompra: number;
        cashbackAplicado: number;
        totalNeto: number;
    } | null>(null);

    const {
        data: membership,
        isLoading,
        isError,
    } = useMembershipByClientId(programPublicId, userId);

    const limitOnePerDay = membership?.program.limit_one_per_day ?? false;
    const { data: hasEarnToday, isPending: earnLimitPending } = useEarnLimitToday(
        membership?.id,
        limitOnePerDay
    );

    const { data: staff, isLoading: staffLoading } = useStaff();
    const registerMutation = useRegisterActivity();
    const redeemMutation = useRedeemReward();

    useEffect(() => {
        if (!registerMutation.isSuccess || registerMutation.isPending || !registerMutation.data) {
            return;
        }
        const t = setTimeout(() => registerMutation.reset(), 5000);
        return () => clearTimeout(t);
    }, [
        registerMutation.isSuccess,
        registerMutation.isPending,
        registerMutation.data,
        registerMutation,
    ]);

    useEffect(() => {
        if (!redeemMutation.isSuccess || redeemMutation.isPending || !redeemMutation.data) {
            return;
        }
        const t = setTimeout(() => redeemMutation.reset(), 5000);
        return () => clearTimeout(t);
    }, [redeemMutation.isSuccess, redeemMutation.isPending, redeemMutation.data, redeemMutation]);

    useEffect(() => {
        if (!registerMutation.isSuccess) {
            lastCashbackApplyTotalsRef.current = null;
        }
    }, [registerMutation.isSuccess]);

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

    const handleApplyCashback = async () => {
        if (!membership || !staff) return;
        const total = parseFloat(purchaseAmount.replace(',', '.'));
        if (isNaN(total) || total <= 0) return;

        const cashbackBalance = Number(membership.balance);
        if (cashbackBalance <= 0) return;

        const netPurchase = Math.round((total - cashbackBalance) * 100) / 100;
        if (netPurchase <= 0) {
            setCashbackApplyError(
                'El importe total de la venta debe ser mayor al cashback acumulado.'
            );
            return;
        }

        setCashbackApplyError(null);
        setIsApplyingCashback(true);
        try {
            await redeemMutation.mutateAsync({
                input: {
                    type: 'redeem',
                    programType: null,
                    membershipId: membership.id,
                    programId: membership.program_id,
                    cashbackApplyAll: true,
                },
                staffId: staff.id,
            });
            lastCashbackApplyTotalsRef.current = {
                totalCompra: total,
                cashbackAplicado: cashbackBalance,
                totalNeto: netPurchase,
            };
        } catch {
            setIsApplyingCashback(false);
            return;
        }
        try {
            await registerMutation.mutateAsync({
                input: {
                    type: 'earn',
                    programType: 'cashback',
                    membershipId: membership.id,
                    programId: membership.program_id,
                    quantity: 1,
                    purchaseAmount: netPurchase,
                },
                staffId: staff.id,
            });
            setPurchaseAmount('');
        } catch {
            lastCashbackApplyTotalsRef.current = null;
            setCashbackApplyError(
                'El cashback se aplicó, pero no se pudo registrar la venta. Contacta soporte.'
            );
        } finally {
            setIsApplyingCashback(false);
        }
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

    if (limitOnePerDay && earnLimitPending) {
        return (
            <div className="flex min-h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Cargando...</p>
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
    const earnBlockedForToday = limitOnePerDay && hasEarnToday === true;

    const earnError = registerMutation.isError
        ? parseRegisterEarnError(registerMutation.error)
        : null;
    const earnSuccess = registerMutation.isSuccess && !registerMutation.isPending;
    const redeemSuccess = redeemMutation.isSuccess && !redeemMutation.isPending;
    const earnResult = registerMutation.data;
    const redeemResult = redeemMutation.data;

    const displayBalance = redeemResult?.newBalance ?? earnResult?.newBalance ?? membership.balance;
    const rewardReady =
        (program.type === 'stamps' || program.type === 'points') &&
        isRewardReady({
            programType: program.type,
            rewardCost: program.reward_cost ?? 0,
            balance: displayBalance,
        });

    const formatEarned = () => {
        if (!earnResult) return null;
        const { earnedAmount } = earnResult;
        if (program.type === 'stamps')
            return `+${earnedAmount} sello${earnedAmount !== 1 ? 's' : ''}`;
        if (program.type === 'points') return `+${earnedAmount} puntos`;
        if (program.type === 'cashback') return `+${earnedAmount.toFixed(2)} $`;
        return null;
    };

    const totalParsed = parseFloat(purchaseAmount.replace(',', '.'));
    const cashbackBalance = Number(membership.balance);
    const netForPreview =
        program.type === 'cashback' &&
        !isNaN(totalParsed) &&
        totalParsed > 0 &&
        cashbackBalance > 0 &&
        totalParsed > cashbackBalance
            ? Math.round((totalParsed - cashbackBalance) * 100) / 100
            : null;

    const previewCashbackFinal =
        netForPreview !== null && program.type === 'cashback'
            ? calculateEarnedAmount(program, {
                  type: 'earn',
                  programType: 'cashback',
                  membershipId: membership.id,
                  programId: membership.program_id,
                  quantity: 1,
                  purchaseAmount: netForPreview,
              })
            : null;

    const canApplyCashback = netForPreview !== null && netForPreview > 0;

    const pctCashback = program.cashback_percentage ?? 0;
    const applyTotals = lastCashbackApplyTotalsRef.current;
    const netPurchaseFromEarn =
        earnResult && program.type === 'cashback' && pctCashback > 0
            ? earnResult.earnedAmount / (pctCashback / 100)
            : 0;

    return (
        <div className="space-y-6">
            <div className="mx-auto w-full max-w-md px-1">
                <MembershipCardPreview
                    businessName={membership.program.business.name}
                    programName={membership.program.name}
                    programType={membership.program.type}
                    rewardDescription={membership.program.reward_description}
                    rewardCost={membership.program.reward_cost ?? 0}
                    cashbackPercentage={membership.program.cashback_percentage ?? 0}
                    pointsPercentage={membership.program.points_percentage ?? 0}
                    balance={displayBalance}
                    cardTheme={membership.program.card_theme}
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
                ) : earnBlockedForToday ? (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-center text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-100">
                        <p className="font-medium">Límite diario alcanzado</p>
                        <p className="mt-2 text-amber-800/90 dark:text-amber-100/90">
                            {EARN_PER_DAY_LIMIT_MESSAGE}
                        </p>
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

                        {program.type === 'points' && (
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
                                    Se calcularán los puntos según el programa
                                </FieldDescription>
                                <Button
                                    size="lg"
                                    onClick={handleRegisterPurchase}
                                    disabled={
                                        registerMutation.isPending ||
                                        redeemMutation.isPending ||
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

                        {program.type === 'cashback' && (
                            <div className="space-y-6">
                                <FieldGroup>
                                    <FieldLabel>Importe total de la venta ($)</FieldLabel>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0,00"
                                        value={purchaseAmount}
                                        onChange={(e) => {
                                            setPurchaseAmount(e.target.value);
                                            setCashbackApplyError(null);
                                        }}
                                    />

                                    {netForPreview !== null && netForPreview > 0 && (
                                        <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3 py-3 text-left text-sm">
                                            <p className="font-medium text-foreground">
                                                Vista previa al aplicar cashback
                                            </p>
                                            <ul className="mt-2 space-y-1 text-muted-foreground">
                                                <li>
                                                    Total compra:{' '}
                                                    <span className="text-foreground">
                                                        {totalParsed.toFixed(2)} $
                                                    </span>
                                                </li>
                                                <li>
                                                    Cashback:{' '}
                                                    <span className="text-foreground">
                                                        {cashbackBalance.toFixed(2)} $
                                                    </span>
                                                </li>
                                                <li>
                                                    Total neto (compra − cashback):{' '}
                                                    <span className="text-foreground">
                                                        {netForPreview.toFixed(2)} $
                                                    </span>
                                                </li>
                                                <li>
                                                    Cashback final en tarjeta:{' '}
                                                    <span className="font-medium text-foreground">
                                                        {previewCashbackFinal !== null
                                                            ? previewCashbackFinal.toFixed(2)
                                                            : '—'}{' '}
                                                        $
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        onClick={handleApplyCashback}
                                        disabled={
                                            isApplyingCashback ||
                                            redeemMutation.isPending ||
                                            registerMutation.isPending ||
                                            !canApplyCashback
                                        }
                                        className="w-full"
                                    >
                                        <Wallet className="mr-2 size-5" />
                                        {isApplyingCashback ? 'Procesando...' : 'Aplicar cashback'}
                                    </Button>
                                    {cashbackApplyError && (
                                        <p className="text-center text-sm text-destructive">
                                            {cashbackApplyError}
                                        </p>
                                    )}

                                    <Button
                                        size="lg"
                                        onClick={handleRegisterPurchase}
                                        disabled={
                                            registerMutation.isPending ||
                                            redeemMutation.isPending ||
                                            isApplyingCashback ||
                                            !purchaseAmount ||
                                            isNaN(parseFloat(purchaseAmount.replace(',', '.'))) ||
                                            parseFloat(purchaseAmount.replace(',', '.')) <= 0
                                        }
                                        className="mt-2 w-full"
                                    >
                                        <DollarSign className="mr-2 size-5" />
                                        {registerMutation.isPending || isApplyingCashback
                                            ? 'Registrando...'
                                            : 'Registrar compra'}
                                    </Button>
                                </FieldGroup>
                            </div>
                        )}
                    </>
                )}
            </div>

            {earnError?.type === RegisterEarnErrorType.DefaultError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                    {earnError.message}
                </div>
            )}

            {earnSuccess && earnResult && (
                <div className="space-y-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                    {program.type === 'cashback' && redeemSuccess && redeemResult ? (
                        <>
                            <p className="font-medium">¡Cashback aplicado y venta registrada!</p>
                            <ul className="mt-2 space-y-1.5 text-left text-xs sm:text-sm">
                                <li>
                                    Total compra:{' '}
                                    <span className="font-medium text-foreground">
                                        {(
                                            applyTotals?.totalCompra ??
                                            (redeemResult.redeemedAmount ?? 0) + netPurchaseFromEarn
                                        ).toFixed(2)}{' '}
                                        $
                                    </span>
                                </li>
                                <li>
                                    Cashback:{' '}
                                    <span className="font-medium text-foreground">
                                        {(
                                            applyTotals?.cashbackAplicado ??
                                            redeemResult.redeemedAmount ??
                                            0
                                        ).toFixed(2)}{' '}
                                        $
                                    </span>
                                </li>
                                <li>
                                    Total neto:{' '}
                                    <span className="font-medium text-foreground">
                                        {(applyTotals?.totalNeto ?? netPurchaseFromEarn).toFixed(2)}{' '}
                                        $
                                    </span>
                                </li>
                                <li>
                                    Cashback acumulado ({pctCashback}%):{' '}
                                    <span className="font-medium text-foreground">
                                        {earnResult.earnedAmount.toFixed(2)} $
                                    </span>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <>
                            <p className="font-medium">¡Actividad registrada correctamente!</p>
                            <p>
                                {formatEarned()} · Nuevo saldo:{' '}
                                {program.type === 'cashback'
                                    ? `${earnResult.newBalance.toFixed(2)} $`
                                    : program.type === 'stamps'
                                      ? `${earnResult.newBalance} / ${program.reward_cost} sellos`
                                      : `${earnResult.newBalance} puntos`}
                            </p>
                        </>
                    )}
                </div>
            )}

            {redeemSuccess &&
                redeemResult &&
                !(program.type === 'cashback' && earnSuccess && earnResult) && (
                    <div className="space-y-1 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                        <p className="font-medium">
                            {program.type === 'cashback'
                                ? '¡Cashback aplicado correctamente!'
                                : '¡Recompensa otorgada correctamente!'}
                        </p>
                        <p>
                            {program.type === 'cashback' ? (
                                <>
                                    Aplicado: {redeemResult.redeemedAmount?.toFixed(2) ?? '—'} $ ·
                                    Nuevo saldo: {redeemResult.newBalance.toFixed(2)} $
                                </>
                            ) : program.type === 'stamps' ? (
                                <>
                                    Nuevo saldo: {redeemResult.newBalance} / {program.reward_cost}{' '}
                                    sellos
                                </>
                            ) : (
                                <>Nuevo saldo: {redeemResult.newBalance} puntos</>
                            )}
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
