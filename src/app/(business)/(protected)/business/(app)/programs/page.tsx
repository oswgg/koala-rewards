'use client';

import { CreateNewProgramButton } from '@/modules/programs/components/new/create-program-button';
import {
    ProgramCardPreview,
    ProgramCardPreviewSkeleton,
} from '@/modules/programs/components/program-card-preview';
import { mockLoyaltyPrograms } from '@/modules/programs/data/mock-loyalty-programs';
import { usePrograms } from '@/modules/programs/hooks/usePrograms';

export default function ProgramsPage() {
    const { programs, isLoading, isError, error } = usePrograms();

    if (isLoading)
        return (
            <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold md:text-2xl">Programas</h1>
                        <p className="mt-1 text-muted-foreground">
                            Tarjetas de fidelidad de tu establecimiento
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <ProgramCardPreviewSkeleton />
                </div>
            </div>
        );
    if (isError) return <div>Error: {error?.message}</div>;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold md:text-2xl">Programas</h1>
                    <p className="mt-1 text-muted-foreground">
                        Tarjetas de fidelidad de tu establecimiento
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:justify-start sm:gap-4">
                {programs
                    .filter((p) => p.is_active)
                    .map((program, index) => (
                        <ProgramCardPreview key={program.id} program={program} index={index} />
                    ))}
                <CreateNewProgramButton />
            </div>

            {mockLoyaltyPrograms.filter((p) => p.is_active).length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                    <p className="text-muted-foreground">Aún no tienes programas de fidelidad.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Crea tu primera tarjeta para empezar.
                    </p>
                </div>
            )}
        </div>
    );
}
