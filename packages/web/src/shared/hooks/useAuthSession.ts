'use client';

import { useUser } from './useUser';

import type { User } from '@/shared/types/user';

export interface UseAuthSessionReturn {
    /** true si hay un usuario con sesión activa */
    isAuthenticated: boolean;
    /** true mientras se resuelve el estado de sesión */
    isLoading: boolean;
    /** Usuario actual o null si no hay sesión */
    user: User | null;
    /** Error al obtener la sesión, si hubo */
    error: Error | null;
}

/**
 * Hook para verificar si el usuario tiene sesión iniciada.
 * Usa AuthService a través de useUser (desacoplado del proveedor de auth).
 */
export function useAuthSession(): UseAuthSessionReturn {
    const { user, isLoading, error } = useUser();

    return {
        isAuthenticated: user !== null,
        isLoading,
        user,
        error,
    };
}
