'use client';

import { motion } from 'motion/react';
import { CardTheme } from './mermbership-card-detail';

export function PointsDisplay({
    balance,
    rewardCost,
    theme,
    size = 'sm',
    animateChange = false,
}: {
    balance: number;
    rewardCost: number;
    theme: CardTheme;
    size?: 'sm' | 'lg';
    animateChange?: boolean;
}) {
    const progress = Math.min(1, balance / rewardCost);
    return (
        <div className={size === 'sm' ? 'mt-4 space-y-2' : 'mt-6 space-y-3'}>
            <div className="flex items-baseline">
                <motion.span
                    style={{ color: theme.text }}
                    key={balance}
                    initial={animateChange ? { scale: 1.4, opacity: 0.8 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                    }}
                    className={`font-bold ${size === 'sm' ? 'text-3xl' : 'text-5xl'}`}
                >
                    {balance}
                </motion.span>
                <span
                    className={`ml-1 ${size === 'sm' ? 'text-sm' : 'text-lg'}`}
                    style={{ color: theme.sub }}
                >
                    / {rewardCost} pts
                </span>
            </div>
            <div
                className={`overflow-hidden rounded-full ${size === 'sm' ? 'h-2' : 'h-3'}`}
                style={{ backgroundColor: theme.stampBg }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: theme.stamp }}
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={
                        animateChange
                            ? { type: 'spring' as const, stiffness: 300, damping: 25 }
                            : { type: 'spring' as const, stiffness: 100, damping: 20 }
                    }
                />
            </div>
        </div>
    );
}
