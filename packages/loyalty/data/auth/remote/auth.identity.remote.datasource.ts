import type { User } from '@vado/loyalty/core';

export interface AuthIdentityRemoteDatasource {
    getCurrentUser(): Promise<User | null>;
}
