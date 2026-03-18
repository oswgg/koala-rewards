'use client';

import { CreateNewProgramButton } from '@/modules/programs/components/new/create-program-button';
import {
    ProgramCardPreview,
    ProgramCardPreviewSkeleton,
} from '@/modules/programs/components/program-card-preview';
import { usePrograms } from '@/modules/programs/hooks/usePrograms';

export default function ProgramsPage() {
    const { programs, isLoading, isError, error } = usePrograms();

    if (isLoading)
        return (
            <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-open-sauce font-semibold md:text-2xl">
                            Programas
                        </h1>
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
                    <h1 className="text-xl font-open-sauce font-black md:text-2xl">Programas</h1>
                    <p className="mt-1 text-muted-foreground">
                        Tarjetas de fidelidad de tu establecimiento
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                {programs
                    .filter((p) => p.is_active)
                    .map((program) => (
                        <div key={program.id} className="min-w-[360px]">
                            <ProgramCardPreview program={program} />
                        </div>
                    ))}
                <div className="w-[280px]">
                    <CreateNewProgramButton />
                </div>
            </div>
        </div>
    );
}
