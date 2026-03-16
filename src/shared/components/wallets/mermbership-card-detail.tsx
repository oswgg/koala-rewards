'use client';

import { Gift, X } from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { isRewardReady } from '@/shared/lib/reward';
import type { LoyaltyProgramType, StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { StampsDisplay } from './stamps-display';
import { PointsDisplay } from './points-display';
import { CashbackDisplay } from './cashback-display';

export const typeConfig: Record<LoyaltyProgramType, { label: string }> = {
    stamps: { label: 'Tarjeta de sellos' },
    points: { label: 'Tarjeta de puntos' },
    cashback: { label: 'Tarjeta cashback' },
};

export interface CardTheme {
    bg: string;
    text: string;
    sub: string;
    stamp: string;
    stampBg: string;
    logo: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getRewardText(program: StoredLoyaltyProgram, balance: number): string {
    switch (program.type) {
        case 'stamps': {
            const remaining = Math.max(0, program.reward_cost - balance);
            if (remaining <= 0) return '¡Recompensa disponible!';
            return `Consigue ${remaining} más · ${program.reward_description}`;
        }
        case 'points': {
            const remaining = Math.max(0, program.reward_cost - balance);
            if (remaining <= 0) return '¡Canjea tu recompensa!';
            return `${remaining} puntos más para tu recompensa`;
        }
        case 'cashback':
            return `${program.cashback_percentage}% cashback en cada compra`;
    }
}

const NEUTRAL_THEME: CardTheme = {
    bg: 'oklch(0.98 0 0)',
    text: 'oklch(0.15 0 0)',
    sub: 'oklch(0.45 0 0)',
    stamp: 'oklch(0.7 0.1 250)',
    stampBg: 'oklch(0.92 0 0)',
    logo: 'oklch(0.9 0 0)',
};

export const CARD_THEMES: CardTheme[] = [
    {
        bg: '#1a3c5e',
        text: '#fff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#34d399',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },
    {
        bg: '#7c3aed',
        text: '#fff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#c4b5fd',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },
    {
        bg: '#d97706',
        text: '#1c1917',
        sub: 'rgba(0,0,0,0.5)',
        stamp: '#78350f',
        stampBg: 'rgba(0,0,0,0.08)',
        logo: 'rgba(0,0,0,0.1)',
    },
    {
        bg: '#dc2626',
        text: '#fff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#fee2e2',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },
    {
        bg: '#0d9488',
        text: '#fff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#99f6e4',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },
    {
        bg: '#2563eb',
        text: '#fff',
        sub: 'rgba(255,255,255,0.6)',
        stamp: '#bfdbfe',
        stampBg: 'rgba(255,255,255,0.12)',
        logo: 'rgba(255,255,255,0.18)',
    },
];

export interface MemberShipCardDetailViewProps {
    program: StoredLoyaltyProgram;
    balance?: number;
    qrUrl: string;
    theme?: CardTheme;
    variant?: 'business' | 'customer';
    onClose?: () => void;
    size?: 'sm' | 'lg';
    /** Oculta la sección del QR (útil para previsualización antes de unirse) */
    showQr?: boolean;
    /** Indica que el balance acaba de cambiar (para animación) */
    isBalanceJustChanged?: boolean;
}

/**
 * Vista de detalle compartida de una tarjeta de fidelidad.
 * Usada en: wallet expandido (cliente), previsualización en listado de programas (business).
 * - Cliente: QR para que staff escanee y registre visita/venta
 * - Business: QR para que clientes se unan al programa
 */
export function MemberShipCardDetailView({
    program,
    balance = 0,
    qrUrl,
    theme: themeProp,
    variant = 'business',
    onClose,
    size = 'lg',
    showQr = true,
    isBalanceJustChanged = false,
}: MemberShipCardDetailViewProps) {
    const theme = themeProp ?? NEUTRAL_THEME;
    const typeLabel = typeConfig[program.type].label;
    const rewardReady = variant === 'customer' && isRewardReady(program, balance);

    return (
        <motion.div
            style={{
                backgroundColor: theme.bg,
                color: theme.text,
                boxShadow: rewardReady
                    ? '0 25px 60px rgba(0,0,0,0.35), 0 0 0 3px rgba(34, 197, 94, 0.7), 0 0 40px rgba(34, 197, 94, 0.3)'
                    : variant === 'customer'
                      ? '0 25px 60px rgba(0,0,0,0.35)'
                      : themeProp
                        ? '0 8px 32px rgba(0,0,0,0.18)'
                        : undefined,
                border:
                    variant === 'business' && !themeProp ? '1px solid oklch(0.9 0 0)' : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
            animate={
                rewardReady
                    ? {
                          boxShadow: [
                              '0 25px 60px rgba(0,0,0,0.35), 0 0 0 3px rgba(34, 197, 94, 0.7), 0 0 40px rgba(34, 197, 94, 0.3)',
                              '0 25px 60px rgba(0,0,0,0.35), 0 0 0 3px rgba(34, 197, 94, 0.9), 0 0 50px rgba(34, 197, 94, 0.4)',
                              '0 25px 60px rgba(0,0,0,0.35), 0 0 0 3px rgba(34, 197, 94, 0.7), 0 0 40px rgba(34, 197, 94, 0.3)',
                          ],
                      }
                    : {}
            }
            transition={{
                duration: 2,
                repeat: rewardReady ? Infinity : 0,
                ease: 'easeInOut',
            }}
            className="relative overflow-hidden rounded-3xl"
        >
            {rewardReady && (
                <div className="flex items-center justify-center gap-2 bg-emerald-500 p-3 text-xs font-bold text-white shadow-lg">
                    <Gift className="size-4 shrink-0" />
                    ¡Tu recompensa está lista! Ve al negocio para canjearla
                </div>
            )}
            {onClose && (
                <button
                    type="button"
                    className="absolute right-4 z-10 flex size-8 items-center justify-center rounded-full"
                    style={{
                        top: rewardReady ? 12 : 16,
                        backgroundColor: rewardReady ? 'rgba(255,255,255,0.9)' : theme.logo,
                        color: rewardReady ? '#065f46' : theme.text,
                    }}
                    onClick={onClose}
                >
                    <X className="size-4" />
                </button>
            )}

            <div
                className="flex items-center gap-3 px-6 pb-3"
                style={{ paddingTop: rewardReady ? 16 : 20 }}
            >
                <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
                    style={{ backgroundColor: theme.logo, color: theme.text }}
                >
                    {getInitials(program.name)}
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: theme.sub }}
                    >
                        {typeLabel}
                    </p>
                    <h3 className="text-lg font-bold leading-tight">{program.business.name}</h3>
                    <p className="mt-0.5 text-xs" style={{ color: theme.sub }}>
                        {program.reward_description}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 px-6 pb-8">
                <div className={size === 'sm' ? 'mt-1' : 'mt-2'}>
                    {program.type === 'stamps' && (
                        <StampsDisplay
                            total={program.reward_cost}
                            earned={balance}
                            theme={theme}
                            size={size}
                            animateNewStamp={isBalanceJustChanged}
                        />
                    )}
                    {program.type === 'points' && (
                        <PointsDisplay
                            balance={balance}
                            rewardCost={program.reward_cost}
                            theme={theme}
                            size={size}
                            animateChange={isBalanceJustChanged}
                        />
                    )}
                    {program.type === 'cashback' && (
                        <CashbackDisplay
                            balance={balance}
                            percentage={program.cashback_percentage}
                            theme={theme}
                            size={size}
                            animateChange={isBalanceJustChanged}
                        />
                    )}
                </div>

                {showQr && (
                    <div className="flex flex-col items-center gap-2">
                        <p
                            className="text-center text-[11px] font-medium"
                            style={{ color: theme.sub }}
                        >
                            {variant === 'customer'
                                ? 'Escanea para registrar visita o venta'
                                : 'Escanea para unirte al programa'}
                        </p>
                        <div
                            className="flex items-center justify-center rounded-xl p-2"
                            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                        >
                            <QRCode
                                value={qrUrl}
                                size={size === 'lg' ? 160 : 130}
                                bgColor="#ffffff"
                                fgColor="#0a0a0a"
                            />
                        </div>
                    </div>
                )}

                <p
                    className={`text-center font-medium ${rewardReady ? 'text-sm font-bold' : 'text-xs'}`}
                    style={{
                        color: rewardReady ? '#22c55e' : theme.sub,
                        textShadow: rewardReady ? '0 0 16px rgba(34, 197, 94, 0.5)' : undefined,
                    }}
                >
                    {getRewardText(program, balance)}
                </p>
            </div>
        </motion.div>
    );
}
