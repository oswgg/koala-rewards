'use client';

import { useEffect, useState } from 'react';

import { authRepository } from '@/infrastructure';
import { User } from '@koalacards/loyalty';

export interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook para obtener el usuario actual. Usa AuthRepository (desacoplado del proveedor).
 */
export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authRepository.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return {
        user,
        isLoading,
        error,
    };
}
