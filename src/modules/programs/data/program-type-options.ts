import { Banknote, Coins, Stamp, StampIcon } from 'lucide-react';

import type { FormRadioGroupOption } from '@/shared/components/form-radio-group';
import type { LoyaltyProgramType } from '@/shared/types/loyalty-program';

export const programTypeOptions: FormRadioGroupOption<LoyaltyProgramType>[] = [
    {
        value: 'stamps',
        label: 'Tarjeta de sellos',
        description: 'El cliente acumula sellos por compra y canjea por recompensa',
    },
    {
        value: 'points',
        label: 'Tarjeta de puntos',
        description: 'Acumula puntos por cada $ gastado',
    },
    {
        value: 'cashback',
        label: 'Tarjeta cashback',
        description: 'Porcentaje de cashback en cada compra',
    },
];
