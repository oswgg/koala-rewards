'use client';

import { Gift } from 'lucide-react';
import { motion } from 'motion/react';
import { isRewardReady } from '@/shared/lib/reward';
import { getCardTheme, type CardTheme } from './mermbership-card-detail';
import { LoyaltyProgramType } from '@/shared/types/loyalty-program';
import { StampsDisplay } from './stamps-display';
import { PointsDisplay } from './points-display';
import { CashbackDisplay } from './cashback-display';

export const CARD_HEIGHT = 275;
export const PEEK = 72;

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getRewardText({
    programType,
    rewardCost,
    balance,
    rewardDescription,
    cashbackPercentage,
}: {
    programType: LoyaltyProgramType;
    rewardCost: number;
    balance: number;
    rewardDescription: string;
    cashbackPercentage: number;
}): string {
    switch (programType) {
        case 'stamps': {
            const remaining = Math.max(0, rewardCost - balance);
            if (remaining <= 0) return '¡Recompensa disponible!';
            return `Consigue ${remaining} más · ${rewardDescription}`;
        }
        case 'points': {
            const remaining = Math.max(0, rewardCost - balance);
            if (remaining <= 0) return '¡Canjea tu recompensa!';
            return `${remaining} puntos más para tu recompensa`;
        }
        case 'cashback':
            return `${cashbackPercentage}% cashback en cada compra`;
    }
}

export interface MembershipCardPreviewProps {
    cardTheme?: string | null;
    isBalanceJustChanged?: boolean;
    businessName: string;
    programName: string;
    programType: LoyaltyProgramType;
    rewardDescription: string | null;
    rewardCost: number;
    balance: number;
    cashbackPercentage: number;
    pointsPercentage: number;
}

export function MembershipCardPreview({
    cardTheme,
    isBalanceJustChanged = false,
    businessName,
    programName,
    programType,
    rewardDescription,
    rewardCost,
    cashbackPercentage,
    pointsPercentage,
    balance,
}: MembershipCardPreviewProps) {
    const theme = getCardTheme(cardTheme);
    const rewardReady = isRewardReady({ programType, rewardCost, balance });

    return (
        <motion.div
            style={{
                height: CARD_HEIGHT,
                backgroundColor: theme.bg,
                color: theme.text,
                boxShadow: rewardReady
                    ? '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px rgba(34, 197, 94, 0.6), 0 0 24px rgba(34, 197, 94, 0.25)'
                    : '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
            }}
            className="relative w-full overflow-hidden rounded-2xl"
            animate={
                rewardReady
                    ? {
                          boxShadow: [
                              '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px rgba(34, 197, 94, 0.6), 0 0 24px rgba(34, 197, 94, 0.25)',
                              '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px rgba(34, 197, 94, 0.8), 0 0 32px rgba(34, 197, 94, 0.35)',
                              '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 2px rgba(34, 197, 94, 0.6), 0 0 24px rgba(34, 197, 94, 0.25)',
                          ],
                      }
                    : {}
            }
            transition={{
                duration: 2,
                repeat: rewardReady ? Infinity : 0,
                ease: 'easeInOut',
            }}
        >
            {rewardReady && (
                <div
                    className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center gap-1.5 rounded-t-2xl bg-emerald-500/95 px-3 py-1.5 text-xs font-bold text-white shadow-md"
                    style={{ backdropFilter: 'blur(4px)' }}
                >
                    <Gift className="size-3.5 shrink-0" />
                    ¡Recompensa lista para canjear!
                </div>
            )}
            <div className={`flex items-center gap-3 px-5 pb-3 ${rewardReady ? 'pt-10' : 'pt-4'}`}>
                <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: theme.logo, color: theme.text }}
                >
                    {getInitials(programName)}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold leading-tight">
                        {businessName}
                    </h3>
                    <p className="mt-0.5 truncate text-xs" style={{ color: theme.sub }}>
                        {rewardDescription}
                    </p>
                </div>
            </div>

            <div className="px-5">
                <CardBody
                    programType={programType}
                    rewardCost={rewardCost}
                    rewardDescription={rewardDescription}
                    cashbackPercentage={cashbackPercentage}
                    balance={balance}
                    theme={theme}
                    isBalanceJustChanged={isBalanceJustChanged}
                />
            </div>

            {rewardDescription && (
                <div className="absolute bottom-4 left-5 right-5">
                    <p
                        className={`font-medium ${rewardReady ? 'text-sm font-semibold' : 'text-xs'}`}
                        style={{
                            color: rewardReady ? '#22c55e' : theme.sub,
                            textShadow: rewardReady ? '0 0 12px rgba(34, 197, 94, 0.4)' : undefined,
                        }}
                    >
                        {getRewardText({
                            programType,
                            rewardCost,
                            balance,
                            rewardDescription,
                            cashbackPercentage,
                        })}
                    </p>
                </div>
            )}

            <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-2xl"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.08), transparent)',
                }}
            />
        </motion.div>
    );
}

function CardBody({
    programType,
    rewardCost,
    rewardDescription,
    cashbackPercentage,
    balance,
    theme,
    size = 'sm',
    isBalanceJustChanged = false,
}: {
    programType: LoyaltyProgramType;
    rewardCost: number;
    rewardDescription: string | null;
    cashbackPercentage: number;
    balance: number;
    theme: CardTheme;
    size?: 'sm' | 'lg';
    isBalanceJustChanged?: boolean;
}) {
    return (
        <>
            {programType === 'stamps' && (
                <StampsDisplay
                    total={rewardCost}
                    earned={balance}
                    theme={theme}
                    size={size}
                    animateNewStamp={isBalanceJustChanged}
                />
            )}
            {programType === 'points' && (
                <PointsDisplay
                    balance={balance}
                    rewardCost={rewardCost}
                    theme={theme}
                    size={size}
                    animateChange={isBalanceJustChanged}
                />
            )}
            {programType === 'cashback' && (
                <CashbackDisplay
                    balance={balance}
                    percentage={cashbackPercentage}
                    theme={theme}
                    size={size}
                    animateChange={isBalanceJustChanged}
                />
            )}
        </>
    );
}
