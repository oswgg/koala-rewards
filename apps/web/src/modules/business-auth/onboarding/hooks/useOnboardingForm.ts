'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { businessRepository } from '@/infrastructure';
import { businessRoutes } from '@/shared/lib/routes';
import { slugify } from '@koalacards/loyalty';

export function useOnboardingForm() {
    const router = useRouter();
    const [name, setName] = useState('');

    const createBusinessMutation = useMutation({
        mutationFn: async (businessName: string) => {
            const slug = slugify(businessName) || 'negocio';
            return businessRepository.create({
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
