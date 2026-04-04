import { Business, CreateBusinessInput } from '@vado/loyalty/core/domain/types/business';

export interface BusinessesRemoteDataSource {
    create(input: CreateBusinessInput): Promise<Business>;
}
