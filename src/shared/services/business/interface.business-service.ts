import type { Business } from '@/shared/types/business';
import { User } from '@/shared/types/user';

export interface BusinessService {
    create: (input: {
        name: string;
        slug: string;
        user: User;
    }) => Promise<Business>;
}
