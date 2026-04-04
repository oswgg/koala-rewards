'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    buildCustomerScanUrl,
    CARD_HEIGHT,
    getCardTheme,
    MembershipCardPreview,
    MembershipWithProgram,
    PEEK,
} from '@koalacards/loyalty';
import { getAppBaseUrlForQr } from '@/shared/lib/qr-data';
import { MemberShipCardDetailView } from './mermbership-card-detail';

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

export function CardWallet({
    memberships,
    newlyAddedId,
    balanceChangedId,
}: {
    memberships: MembershipWithProgram[];
    newlyAddedId?: string | null;
    balanceChangedId?: string | null;
}) {
    const [peekedIndex, setPeekedIndex] = useState<number | null>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const pushAmount = CARD_HEIGHT - PEEK;

    const handleCardClick = useCallback(
        (index: number) => {
            if (peekedIndex === index) {
                setExpandedIndex(index);
                setPeekedIndex(null);
            } else {
                setPeekedIndex(index);
                setExpandedIndex(null);
            }
        },
        [peekedIndex]
    );

    const handleCollapse = useCallback(() => {
        setExpandedIndex(null);
        setPeekedIndex(null);
    }, []);

    if (memberships.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-lg font-open-sauce font-bold text-foreground">
                    No tienes tarjetas aún
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Escanea un código QR para agregar tu primera tarjeta
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="px-4 pt-10 pb-24" onClick={handleCollapse}>
                {memberships.map((m, i) => {
                    const isPeeked = peekedIndex === i;
                    const isBelowPeeked = peekedIndex !== null && i > peekedIndex;

                    const isNewlyAdded = newlyAddedId === m.id;
                    const isBalanceJustChanged = balanceChangedId === m.id;

                    return (
                        <motion.div
                            key={m.id}
                            style={{
                                marginTop: i === 0 ? 0 : -(CARD_HEIGHT - PEEK),
                                zIndex: isPeeked ? 50 : i + 1,
                            }}
                            initial={isNewlyAdded ? { scale: 0.8, opacity: 0 } : false}
                            animate={{
                                y: isPeeked ? -20 : isBelowPeeked ? pushAmount : 0,
                                scale: isPeeked ? 1.02 : isNewlyAdded ? 1 : 1,
                                opacity: 1,
                            }}
                            transition={
                                isNewlyAdded
                                    ? { type: 'spring' as const, stiffness: 300, damping: 25 }
                                    : spring
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(i);
                            }}
                            className="relative cursor-pointer"
                        >
                            <div className="relative">
                                {isNewlyAdded && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2, duration: 0.2 }}
                                        className="absolute -right-1 -top-1 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md"
                                    >
                                        ¡Nueva!
                                    </motion.span>
                                )}
                                <MembershipCardPreview
                                    cardTheme={m.program.card_theme}
                                    isBalanceJustChanged={isBalanceJustChanged}
                                    businessName={m.program.business.name}
                                    programName={m.program.name}
                                    programType={m.program.type}
                                    rewardDescription={m.program.reward_description}
                                    rewardCost={m.program.reward_cost ?? 0}
                                    cashbackPercentage={m.program.cashback_percentage ?? 0}
                                    pointsPercentage={m.program.points_percentage ?? 0}
                                    balance={m.balance}
                                />
                            </div>
                        </motion.div>
                    );
                })}

                <motion.div
                    animate={{ height: peekedIndex !== null ? pushAmount : 0 }}
                    transition={spring}
                    className="shrink-0"
                />
            </div>

            <AnimatePresence>
                {expandedIndex !== null && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCollapse}
                            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 40 }}
                            transition={spring}
                            className="fixed inset-x-0 top-16 z-70 mx-auto w-full max-w-md px-4"
                        >
                            <MemberShipCardDetailView
                                businessName={memberships[expandedIndex].program.business.name}
                                programName={memberships[expandedIndex].program.name}
                                programType={memberships[expandedIndex].program.type}
                                rewardDescription={
                                    memberships[expandedIndex].program.reward_description
                                }
                                rewardCost={memberships[expandedIndex].program.reward_cost ?? 0}
                                cashbackPercentage={
                                    memberships[expandedIndex].program.cashback_percentage ?? 0
                                }
                                pointsPercentage={
                                    memberships[expandedIndex].program.points_percentage ?? 0
                                }
                                balance={memberships[expandedIndex].balance}
                                onClose={handleCollapse}
                                isBalanceJustChanged={
                                    balanceChangedId === memberships[expandedIndex]?.id
                                }
                                qrUrl={buildCustomerScanUrl(
                                    getAppBaseUrlForQr(),
                                    memberships[expandedIndex].program.public_id,
                                    memberships[expandedIndex].profile_id
                                )}
                                theme={getCardTheme(memberships[expandedIndex].program.card_theme)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
