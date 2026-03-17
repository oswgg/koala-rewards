'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { AuthForm } from '@/shared/components/auth-form';
import { Button } from '@/shared/components/ui/button';
import { MembershipCardPreview } from '@/shared/components/wallets/membership-card-preview';
import { useAuthSession } from '@/shared/hooks/useAuthSession';
import { useProgramByPublicId } from '@/modules/programs/hooks/useProgramByPublicId';
import { useJoinProgram } from '@/modules/memberships/hooks/useJoinProgram';
import { useHasMembership } from '@/modules/memberships/hooks/useHasMembership';
import { customerRoutes } from '@/shared/lib/routes';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

export default function JoinProgramPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { programId } = useParams<{ programId: string }>();
    const publicId = programId as string;

    const { isAuthenticated, isLoading: authLoading, user } = useAuthSession();
    const {
        program,
        isLoading: programLoading,
        isError: programError,
    } = useProgramByPublicId(publicId);
    const { hasMembership, isLoading: membershipLoading } = useHasMembership(program?.id, user?.id);
    const joinMutation = useJoinProgram();

    const goToWallet = () => router.push(customerRoutes.app);

    if (authLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
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

    if (programLoading || membershipLoading) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-muted-foreground">Cargando programa...</p>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="flex min-h-svh flex-col items-center justify-center p-6">
                <p className="text-center text-muted-foreground">
                    No encontramos este programa o ya no está disponible.
                </p>
            </div>
        );
    }

    const handleAccept = async () => {
        if (program && user?.id) {
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

                <div className="w-full">
                    <div className="mx-auto w-full max-w-md px-4">
                        <MembershipCardPreview
                            membership={{
                                id: 'preview',
                                program_id: program.id,
                                user_id: '',
                                membership_client_id: '',
                                balance: 0,
                                created_at: '',
                                public_id: '',
                                business: program.business,
                                program: program as MembershipWithProgram['program'],
                            }}
                            index={0}
                        />
                    </div>
                </div>

                {hasMembership ? (
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
