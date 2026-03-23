import type { Business } from '../../types/business';
import type { User } from '../../types/user';

export interface BusinessService {
    create: (input: { name: string; slug: string; user: User }) => Promise<Business>;
}
