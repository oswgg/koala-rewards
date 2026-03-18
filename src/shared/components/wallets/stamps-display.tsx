'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { CardTheme } from './mermbership-card-detail';

function getStampCols(total: number): number {
    if (total < 3) return total;
    if (total % 3 === 0) return 3;
    if (total % 4 === 0) return 4;
    return 5;
}

export function StampsDisplay({
    total,
    earned,
    theme,
    size = 'sm',
    animateNewStamp = false,
}: {
    total: number;
    earned: number;
    theme: CardTheme;
    size?: 'sm' | 'lg';
    animateNewStamp?: boolean;
}) {
    const cols = getStampCols(total);
    const gap = size === 'sm' ? 12 : 14;
    const colDef =
        size === 'sm'
            ? `repeat(${cols}, minmax(0, 56px))` // crece hasta 56px, nunca más
            : `repeat(${cols}, 52px)`; // fijo en lg

    return (
        <div
            className={size === 'sm' ? 'mt-3' : 'mt-4'}
            style={{
                display: 'grid',
                gridTemplateColumns: colDef,
                gap,
                justifyContent: 'center',
            }}
        >
            {Array.from({ length: total }).map((_, i) => {
                const isFilled = i < earned;
                const isLastEarned = animateNewStamp && i === earned - 1 && earned > 0;
                return (
                    <motion.div
                        key={i}
                        style={{ backgroundColor: isFilled ? theme.stamp : theme.stampBg }}
                        initial={false}
                        animate={
                            isLastEarned
                                ? {
                                      scale: [1, 1.35, 1.15],
                                      boxShadow: [
                                          '0 0 0 0 rgba(255,255,255,0)',
                                          '0 0 0 8px rgba(255,255,255,0.4)',
                                          '0 0 0 0 rgba(255,255,255,0)',
                                      ],
                                  }
                                : {}
                        }
                        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                        className="flex aspect-square items-center justify-center rounded-full"
                    >
                        <motion.div
                            animate={
                                isLastEarned ? { rotate: [0, -12, 8, 0], scale: [1, 1.2, 1] } : {}
                            }
                            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            <Star
                                className={size === 'sm' ? 'size-5' : 'size-5'}
                                style={{
                                    color: isFilled ? theme.bg : theme.sub,
                                    fill: isFilled ? theme.bg : 'transparent',
                                }}
                            />
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
}
