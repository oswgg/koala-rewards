import type { BusinessService } from './interface.business-service';

export const supabaseBusinessService: BusinessService = {
    create: async (input) => {
        const res = await fetch('/api/businesses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to create business');
        return data;
    },
};
