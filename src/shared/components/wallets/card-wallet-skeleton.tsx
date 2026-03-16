'use client';

import { CARD_HEIGHT, PEEK } from './membership-card-preview';

const SKELETON_CARD_COUNT = 3;

const GRAY_SHADES = ['#D1D5DB', '#E5E7EB', '#F3F4F6'];

export function CardWalletSkeleton() {
    const pushAmount = CARD_HEIGHT - PEEK;

    return (
        <div className="px-4 pt-10 pb-24">
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => {
                const cardBg = GRAY_SHADES[i % GRAY_SHADES.length];
                const elementBg = i === 0 ? '#9CA3AF' : '#D1D5DB';
                const elementBgLight = i === 0 ? '#C4C9D4' : '#E5E7EB';

                return (
                    <div
                        key={i}
                        style={{
                            marginTop: i === 0 ? 0 : -pushAmount,
                            height: CARD_HEIGHT,
                            zIndex: i + 1,
                            backgroundColor: cardBg,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        className="relative w-full overflow-hidden rounded-2xl"
                    >
                        <div className="flex h-full flex-col">
                            <div className="flex items-center gap-3 px-5 pb-3 pt-4">
                                <div
                                    className="size-10 shrink-0 rounded-full animate-pulse"
                                    style={{ backgroundColor: elementBg }}
                                />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div
                                        className="h-4 w-24 rounded animate-pulse"
                                        style={{ backgroundColor: elementBg }}
                                    />
                                    <div
                                        className="h-3 w-20 rounded animate-pulse"
                                        style={{ backgroundColor: elementBgLight }}
                                    />
                                </div>
                            </div>

                            <div
                                className="mt-3 grid gap-2 px-5"
                                style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
                            >
                                {Array.from({ length: 10 }).map((_, j) => (
                                    <div
                                        key={j}
                                        className="aspect-square rounded-full animate-pulse"
                                        style={{ backgroundColor: elementBgLight }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
