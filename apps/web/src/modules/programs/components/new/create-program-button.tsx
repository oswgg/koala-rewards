'use client';

import { businessPortalRoutes } from '@koalacards/loyalty';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const CARD_WIDTH = 260;
const CARD_ASPECT = 1 / 1.3;

export function CreateNewProgramButton() {
    return (
        <div className="flex flex-col items-center gap-2">
            <Link
                href={businessPortalRoutes.newProgram}
                style={{
                    width: CARD_WIDTH,
                    aspectRatio: CARD_ASPECT,
                }}
                className="flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-card/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
            >
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/30">
                        <Plus className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Crear nuevo programa
                    </p>
                </div>
            </Link>
        </div>
    );
}
