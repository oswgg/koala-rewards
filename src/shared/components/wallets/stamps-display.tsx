'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { CardTheme } from './mermbership-card-detail';

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
    const cols = Math.min(total, 5);
    return (
        <div
            className={size === 'sm' ? 'mt-3 grid gap-3' : 'mt-4 grid gap-4'}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
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
                        transition={{
                            duration: 0.5,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                        className="flex aspect-square items-center justify-center rounded-full"
                    >
                        <motion.div
                            animate={
                                isLastEarned ? { rotate: [0, -12, 8, 0], scale: [1, 1.2, 1] } : {}
                            }
                            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                            <Star
                                className={size === 'sm' ? 'size-4' : 'size-6'}
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
