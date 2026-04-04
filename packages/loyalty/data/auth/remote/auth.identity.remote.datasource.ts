import type { User } from '@vado/loyalty/core/domain/types/user';

export interface AuthIdentityRemoteDatasource {
    getCurrentUser(): Promise<User | null>;
}
