import { LoyaltyProgramType } from '@vado/loyalty';
import { FormRadioGroupOption } from '@vado/shared/ui';

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
