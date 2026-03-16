'use client';

import { motion } from 'motion/react';
import { CardTheme } from './mermbership-card-detail';

export function CashbackDisplay({
    balance,
    percentage,
    theme,
    size = 'sm',
    animateChange = false,
}: {
    balance: number;
    percentage: number;
    theme: CardTheme;
    size?: 'sm' | 'lg';
    animateChange?: boolean;
}) {
    return (
        <div className={size === 'sm' ? 'mt-4' : 'mt-6'}>
            <motion.span
                className={`font-bold ${size === 'sm' ? 'text-3xl' : 'text-5xl'}`}
                style={{ color: theme.text }}
                initial={false}
                animate={
                    animateChange
                        ? {
                              scale: [1, 1.12, 1.02],
                              opacity: [1, 0.9, 1],
                          }
                        : {}
                }
                transition={{
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                }}
            >
                ${balance.toFixed(2)}
            </motion.span>
            <p
                className={`mt-1 ${size === 'sm' ? 'text-sm' : 'text-lg'}`}
                style={{ color: theme.sub }}
            >
                {percentage}% cashback acumulado
            </p>
        </div>
    );
}
