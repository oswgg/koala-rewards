import { Business, CreateBusinessInput } from '@vado/loyalty/core/domain/types/business';
import { BusinessesRemoteDataSource } from './remote/businesses.remote.datasource.interface';
import { BusinessesRepository } from '@vado/loyalty';

export class BusinessesRepositoryImpl implements BusinessesRepository {
    constructor(private readonly remote: BusinessesRemoteDataSource) {}

    async create(input: CreateBusinessInput): Promise<Business> {
        return await this.remote.create(input);
    }
}
