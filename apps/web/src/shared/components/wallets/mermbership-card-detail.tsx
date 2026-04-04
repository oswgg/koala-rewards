'use client';

import { Gift, X } from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import {
    CARD_THEMES,
    CardTheme,
    CashbackDisplay,
    isRewardReady,
    LoyaltyProgramType,
    PointsDisplay,
    StampsDisplay,
} from '@koalacards/loyalty';

export const typeConfig: Record<LoyaltyProgramType, { label: string }> = {
    stamps: { label: 'Tarjeta de sellos' },
    points: { label: 'Tarjeta de puntos' },
    cashback: { label: 'Tarjeta cashback' },
};

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
    rewardDescription,
    balance,
    cashbackPercentage,
    pointsPercentage,
}: {
    programType: LoyaltyProgramType;
    rewardCost: number;
    balance: number;
    rewardDescription: string;
    cashbackPercentage?: number;
    pointsPercentage?: number;
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

export interface MemberShipCardDetailViewProps {
    // program: StoredLoyaltyProgram;
    businessName: string;
    programName: string;
    balance?: number;
    programType: LoyaltyProgramType;
    rewardDescription: string | null;
    rewardCost: number;
    cashbackPercentage?: number;
    pointsPercentage?: number;
    qrUrl: string;
    theme?: CardTheme;
    variant?: 'business' | 'customer';
    onClose?: () => void;
    size?: 'sm' | 'lg';
    /** Oculta la sección del QR (útil para previsualización antes de unirse) */
    showQr?: boolean;
    /** Indica que el balance acaba de cambiar (para animación) */
    isBalanceJustChanged?: boolean;
    /** Texto personalizado sobre el QR (reemplaza el texto por defecto según variant) */
    qrLabel?: string;
}

/**
 * Vista de detalle compartida de una tarjeta de fidelidad.
 * Usada en: wallet expandido (cliente), previsualización en listado de programas (business).
 * - Cliente: QR para que staff escanee y registre visita/venta
 * - Business: QR para que clientes se unan al programa
 */
export function MemberShipCardDetailView({
    businessName,
    programName,
    programType,
    rewardDescription,
    rewardCost,
    balance = 0,
    cashbackPercentage,
    pointsPercentage,
    qrUrl,
    theme: themeProp,
    variant = 'business',
    onClose,
    size = 'lg',
    showQr = true,
    isBalanceJustChanged = false,
    qrLabel,
}: MemberShipCardDetailViewProps) {
    const theme = themeProp ?? CARD_THEMES.neutral;
    const typeLabel = typeConfig[programType].label;
    const rewardReady =
        variant === 'customer' && isRewardReady({ programType, rewardCost, balance });

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
            className="relative h-full overflow-hidden rounded-3xl"
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
                    {getInitials(programName)}
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className="text-[10px] font-medium uppercase tracking-wider"
                        style={{ color: theme.sub }}
                    >
                        {typeLabel}
                    </p>
                    <h3 className="text-lg font-bold leading-tight">{businessName}</h3>
                    <p className="mt-0.5 text-xs" style={{ color: theme.sub }}>
                        {rewardDescription}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4 px-6 pb-8">
                <div className="mt-1">
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
                            percentage={cashbackPercentage ?? 0}
                            theme={theme}
                            size={size}
                            animateChange={isBalanceJustChanged}
                        />
                    )}
                </div>

                {showQr && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <p
                            className="text-center text-[11px] font-medium"
                            style={{ color: theme.sub }}
                        >
                            {qrLabel ??
                                (variant === 'customer'
                                    ? 'Escanea para registrar visita o venta'
                                    : 'Escanea para unirte al programa')}
                        </p>
                        <div
                            className="flex items-center justify-center rounded-xl p-2"
                            style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                        >
                            <QRCode
                                value={qrUrl}
                                size={180}
                                level="L"
                                bgColor="#ffffff"
                                fgColor="#0a0a0a"
                            />
                        </div>
                    </div>
                )}

                {rewardDescription && (
                    <p
                        className={`text-center font-medium ${rewardReady ? 'text-sm font-bold' : 'text-xs'}`}
                        style={{
                            color: rewardReady ? '#22c55e' : theme.sub,
                            textShadow: rewardReady ? '0 0 16px rgba(34, 197, 94, 0.5)' : undefined,
                        }}
                    >
                        {getRewardText({
                            programType,
                            rewardCost,
                            balance,
                            rewardDescription,
                            cashbackPercentage,
                            pointsPercentage,
                        })}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
