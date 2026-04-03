import { Business, CreateBusinessInput } from '@koalacards/loyalty/core/domain/types/business';

export interface BusinessesRepository {
    create(input: CreateBusinessInput): Promise<Business>;
}
