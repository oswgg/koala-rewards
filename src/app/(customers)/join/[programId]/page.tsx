'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { WifiOff } from 'lucide-react';
import { AuthForm } from '@/shared/components/auth-form';
import { Button } from '@/shared/components/ui/button';
import { MembershipCardPreview } from '@/shared/components/wallets/membership-card-preview';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useProgramByPublicId } from '@/modules/programs/hooks/useProgramByPublicId';
import { useJoinProgram } from '@/modules/memberships/hooks/useJoinProgram';
import { useHasMembership } from '@/modules/memberships/hooks/useHasMembership';
import { useOfflineMemberships } from '@/modules/memberships/hooks/useOfflineMemberships';
import { parseProgramQRParams } from '@/shared/lib/qr-data';
import { customerRoutes } from '@/shared/lib/routes';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

export default function JoinProgramPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { programId } = useParams<{ programId: string }>();
    const searchParams = useSearchParams();
    const publicId = programId as string;

    const { isAuthenticated, isLoading: authLoading, user } = useAuthSession();
    const { isOnline } = useNetworkStatus();
    const {
        program,
        isLoading: programLoading,
        isError: programError,
    } = useProgramByPublicId(isOnline ? publicId : undefined);
    const { hasMembership, isLoading: membershipLoading } = useHasMembership(program?.id, user?.id);
    const joinMutation = useJoinProgram();
    const { createLocalMembership } = useOfflineMemberships();

    const offlineData = parseProgramQRParams(searchParams);

    const offlinePreviewProgram = offlineData
        ? {
              id: publicId,
              business_id: offlineData.business_id,
              public_id: publicId,
              created_at: '',
              is_active: true as const,
              name: offlineData.program_name,
              reward_description: '',
              limit_one_per_day: false,
              type: offlineData.program_type,
              reward_cost: offlineData.required_quantity,
              points_percentage: null,
              cashback_percentage: null,
              business: {
                  id: offlineData.business_id,
                  name: '',
                  slug: '',
                  created_at: '',
              },
          }
        : null;

    const displayProgram = program ?? offlinePreviewProgram;

    const goToWallet = () => router.push(customerRoutes.app);

    if (authLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (!isAuthenticated && isOnline) {
        return (
            <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
                <div className="w-full max-w-sm">
                    <AuthForm
                        type="signup"
                        onSuccess={() => router.push(customerRoutes.join(publicId))}
                    />
                </div>
            </div>
        );
    }

    if (isOnline && (programLoading || membershipLoading)) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-muted-foreground">Cargando programa...</p>
            </div>
        );
    }

    if (!displayProgram) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">
                    No encontramos este programa o ya no está disponible.
                </p>
            </div>
        );
    }

    const canJoinOffline = !isOnline && !!offlineData;

    const handleAccept = async () => {
        const membershipClientId = crypto.randomUUID();

        if (isOnline && program && user?.id) {
            try {
                await joinMutation.mutateAsync({
                    programId: program.id,
                    userId: user.id,
                });
                queryClient.invalidateQueries({ queryKey: ['memberships', user.id] });
                goToWallet();
            } catch (error) {
                console.error('Error al unirse al programa:', error);
            }
        } else if (offlineData && user?.id) {
            await createLocalMembership({
                membership_client_id: membershipClientId,
                program_id: publicId,
                business_id: offlineData.business_id,
                user_id: user.id,
                program_name: offlineData.program_name,
                program_type: offlineData.program_type,
                required_quantity: offlineData.required_quantity,
            });
            goToWallet();
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center p-6 pt-24 gap-6 bg-background">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold">Unirte al programa</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Revisa los detalles y agrega la tarjeta a tu cuenta
                    </p>
                </div>

                {canJoinOffline && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                        <WifiOff className="size-4 shrink-0" />
                        <p>
                            Sin conexión. La tarjeta se guardará localmente y se sincronizará
                            cuando tengas internet.
                        </p>
                    </div>
                )}

                <div className="w-full">
                    <div className="mx-auto w-full max-w-md px-4">
                        <MembershipCardPreview
                            membership={{
                                id: 'preview',
                                program_id: displayProgram.id,
                                user_id: '',
                                membership_client_id: '',
                                balance: 0,
                                created_at: '',
                                public_id: '',
                                business: displayProgram.business,
                                program: displayProgram as MembershipWithProgram['program'],
                            }}
                            index={0}
                        />
                    </div>
                </div>

                {isOnline && hasMembership ? (
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
                            onClick={goToWallet}
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
    );
}
