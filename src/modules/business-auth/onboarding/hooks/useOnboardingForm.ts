'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { businessRoutes } from '@/shared/lib/routes';
import { slugify } from '@/shared/lib/slug';
import { businessService } from '../../../../shared/services/business/implementation.business-service';
import { useUser } from '../../../../shared/hooks/useUser';

export function useOnboardingForm() {
    const router = useRouter();
    const { user } = useUser();
    const [name, setName] = useState('');

    const createBusinessMutation = useMutation({
        mutationFn: async (businessName: string) => {
            const slug = slugify(businessName) || 'negocio';
            return businessService.create({
                user: user!,
                name: businessName,
                slug,
            });
        },
        onSuccess: () => {
            router.push(businessRoutes.dashboard);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await createBusinessMutation.mutateAsync(name.trim());
    };

    return {
        name,
        setName,
        handleSubmit,
        createBusinessMutation,
    };
}
