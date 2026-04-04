'use client';

import { useState } from 'react';
import { QrCode } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MemberShipCardDetailView } from '@/shared/components/wallets/mermbership-card-detail';
import { getAppBaseUrlForQr } from '@/shared/lib/qr-data';
import { Button } from '@koalacards/shared/ui';
import { buildCustomerScanUrl, getCardTheme, MembershipWithProgram } from '@koalacards/loyalty';

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

interface ShowQRToStaffModalProps {
    onOpenChange: (open: boolean) => void;
    membership: MembershipWithProgram;
}

export function ShowQRToStaffModal({ onOpenChange, membership }: ShowQRToStaffModalProps) {
    const [showAlert, setShowAlert] = useState(true);

    return (
        <>
            <MemberShipCardDetailView
                businessName={membership.program.business.name}
                programName={membership.program.name}
                programType={membership.program.type}
                rewardDescription={membership.program.reward_description}
                rewardCost={membership.program.reward_cost ?? 0}
                balance={membership.balance}
                cashbackPercentage={membership.program.cashback_percentage ?? 0}
                pointsPercentage={membership.program.points_percentage ?? 0}
                qrUrl={buildCustomerScanUrl(
                    getAppBaseUrlForQr(),
                    membership.program.public_id,
                    membership.profile_id
                )}
                theme={getCardTheme(membership.program.card_theme)}
                variant="customer"
                size="lg"
                showQr={true}
                qrLabel="Por favor muestre este código QR al staff"
                onClose={() => onOpenChange(false)}
            />

            <AnimatePresence>
                {showAlert && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAlert(false)}
                            className="fixed inset-0 z-80 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 40 }}
                            transition={spring}
                            className="fixed left-1/2 top-1/2 z-81 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/20">
                                    <QrCode className="size-7 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold">
                                        Tarjeta agregada sin conexión
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Por favor muestre el código QR de su tarjeta al staff para
                                        acumular recompensas al instante.
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="mt-6 w-full"
                                size="lg"
                                onClick={() => setShowAlert(false)}
                            >
                                Entendido
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
