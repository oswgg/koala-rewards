'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@vado/shared/ui';
import { useJoinProgram } from '@/modules/memberships/hooks/useJoinProgram';
import { useHasMembershipByProgramPublicId } from '@/modules/memberships/hooks/useHasMembershipByProgramPublicId';
import { ShowQRToStaffModal } from '@/modules/memberships/components/show-qr-to-staff-modal';
import { authRepository } from '@/infrastructure';
import {
    JoinProgramQRData,
    LoyaltyProgramType,
    MembershipCardPreview,
    MembershipWithProgram,
    ProgramSnapshot,
} from '@vado/loyalty';
import { useUser } from '@vado/shared/hooks';

const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };

function qrDataToProgramSnapshot(data: JoinProgramQRData): ProgramSnapshot {
    return {
        id: data.programPublicId,
        public_id: data.programPublicId,
        name: data.programName,
        type: data.programType as LoyaltyProgramType,
        reward_description: data.programReward,
        reward_cost: data.programRewardCost || null,
        cashback_percentage: data.programCashBackPercentage || null,
        points_percentage: data.programPointsPercentage || null,
        card_theme: data.programTheme,
        business: {
            id: '',
            name: data.businessName,
            slug: data.programPublicId,
        },
    };
}

export interface JoinProgramModalProps {
    data: JoinProgramQRData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    /** Called when user successfully joins (for animation + "¡Nueva!" badge) */
    onJoinSuccess?: (membership: MembershipWithProgram) => void;
}

export function JoinProgramModal({
    data,
    open,
    onOpenChange,
    onClose,
    onJoinSuccess,
}: JoinProgramModalProps) {
    const queryClient = useQueryClient();
    const { user } = useUser({ authRepository });
    const { hasMembership, isFetched } = useHasMembershipByProgramPublicId(
        data.programPublicId,
        user?.id
    );
    const joinMutation = useJoinProgram();
    const [showQRModal, setShowQRModal] = useState(false);
    const [offlineMembership, setOfflineMembership] = useState<MembershipWithProgram | null>(null);

    const goToWallet = () => {
        onClose();
    };

    const handleAccept = async () => {
        if (!user?.id) return;
        try {
            const programSnapshot = qrDataToProgramSnapshot(data);
            const result = await joinMutation.mutateAsync({
                programPublicId: data.programPublicId,
                userId: user.id,
                programSnapshot,
            });
            queryClient.invalidateQueries({ queryKey: ['memberships', user.id] });
            onJoinSuccess?.(result.membership);
            if (result.createdOffline) {
                setOfflineMembership(result.membership);
                setShowQRModal(true);
            } else {
                goToWallet();
            }
        } catch (error) {
            console.error('Error al unirse al programa:', error);
        }
    };

    const handleReject = () => {
        onClose();
    };

    if (!open) return null;

    return (
        <>
            <AnimatePresence>
                {offlineMembership && showQRModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowQRModal(false);
                                setOfflineMembership(null);
                                goToWallet();
                            }}
                            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 40 }}
                            transition={spring}
                            className="fixed inset-x-0 top-16 z-70 mx-auto w-full max-w-md px-4"
                        >
                            <ShowQRToStaffModal
                                membership={offlineMembership}
                                onOpenChange={(isOpen) => {
                                    setShowQRModal(isOpen);
                                    if (!isOpen) {
                                        setOfflineMembership(null);
                                        goToWallet();
                                    }
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onOpenChange(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 40 }}
                transition={spring}
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-0 top-1/2 z-50 mx-auto w-full max-w-md -translate-y-1/2 px-4"
            >
                <div className="rounded-2xl border bg-background p-6 shadow-xl">
                    <div className="space-y-4">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">Unirte al programa</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Revisa los detalles y agrega la tarjeta a tu cuenta
                            </p>
                        </div>

                        <div className="mx-auto w-full max-w-md px-2">
                            <MembershipCardPreview
                                businessName={data.businessName}
                                programName={data.programName}
                                programType={data.programType as 'stamps' | 'points' | 'cashback'}
                                rewardDescription={data.programReward || null}
                                rewardCost={data.programRewardCost ?? 0}
                                cashbackPercentage={data.programCashBackPercentage ?? 0}
                                pointsPercentage={data.programPointsPercentage ?? 0}
                                balance={0}
                                cardTheme={data.programTheme}
                            />
                        </div>

                        {!isFetched ? (
                            <p className="text-center text-sm text-muted-foreground">
                                Verificando...
                            </p>
                        ) : hasMembership ? (
                            <>
                                <p className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                                    Ya tienes esta tarjeta en tu cuenta
                                </p>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={goToWallet}
                                    className="w-full min-h-12 py-4"
                                >
                                    Ir a mis tarjetas
                                </Button>
                            </>
                        ) : (
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleReject}
                                    disabled={joinMutation.isPending}
                                    className="min-h-12 flex-1 py-4 text-muted-foreground"
                                >
                                    Rechazar
                                </Button>
                                <Button
                                    size="lg"
                                    className="min-h-12 flex-1 py-4"
                                    onClick={handleAccept}
                                    disabled={joinMutation.isPending}
                                >
                                    {joinMutation.isPending ? 'Agregando...' : 'Unirse'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
