import type { User } from '@koalacards/loyalty/core/domain/types/user';

export interface AuthIdentityRemoteDatasource {
    getCurrentUser(): Promise<User | null>;
}
