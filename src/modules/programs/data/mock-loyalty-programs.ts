import type { LoyaltyProgram, StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

/**
 * Mock loyalty programs for development.
 * Replace with API call when backend is ready.
 */
const mockBusiness = {
    id: 'biz-1',
    name: 'Café Amigo',
    slug: 'cafe-amigo',
    created_at: new Date().toISOString(),
};

export const mockLoyaltyPrograms: StoredLoyaltyProgram[] = [
    {
        id: '1',
        public_id: 'cafe-amigo',
        business_id: 'biz-1',
        name: 'Café Amigo',
        type: 'stamps',
        reward_description: '10 cafés = 1 gratis',
        points_percentage: null,
        cashback_percentage: null,
        reward_cost: 10,
        created_at: new Date().toISOString(),
        is_active: true,
        limit_one_per_day: false,
        business: mockBusiness,
    },
    {
        id: '2',
        public_id: 'puntos-vip',
        business_id: 'biz-1',
        name: 'Puntos VIP',
        type: 'points',
        reward_description: '1 punto por cada $ gastado. Canjea 100 puntos por $5 de descuento.',
        points_percentage: 1,
        cashback_percentage: null,
        reward_cost: 100,
        created_at: new Date().toISOString(),
        is_active: true,
        limit_one_per_day: false,
        business: mockBusiness,
    },
    {
        id: '3',
        public_id: 'cashback-fiel',
        business_id: 'biz-1',
        name: 'Cashback Fiel',
        type: 'cashback',
        reward_description: '5% de cashback en cada compra. Acumula y úsalo cuando quieras.',
        points_percentage: null,
        cashback_percentage: 5,
        reward_cost: null,
        created_at: new Date().toISOString(),
        is_active: true,
        limit_one_per_day: true,
        business: mockBusiness,
    },
];
