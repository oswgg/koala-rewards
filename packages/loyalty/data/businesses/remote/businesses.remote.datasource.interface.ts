import { Business, CreateBusinessInput } from '@vado/loyalty/core';

export interface BusinessesRemoteDataSource {
    create(input: CreateBusinessInput): Promise<Business>;
}
