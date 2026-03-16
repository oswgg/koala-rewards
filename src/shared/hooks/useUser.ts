'use client';

import { useEffect, useState } from 'react';

import { authService } from '@/shared/services/auth/implementation.auth-service';
import type { User } from '@/shared/types/user';

export interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook para obtener el usuario actual. Usa AuthService (desacoplado del proveedor).
 */
export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();

        const unsubscribe = authService.subscribeToAuthChanges((newUser) => {
            setUser(newUser);
        });

        return unsubscribe;
    }, []);

    return {
        user,
        isLoading,
        error,
    };
}
