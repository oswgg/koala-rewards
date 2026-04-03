import { Business, CreateBusinessInput } from '@koalacards/loyalty/core/domain/types/business';

export interface BusinessesRemoteDataSource {
    create(input: CreateBusinessInput): Promise<Business>;
}
