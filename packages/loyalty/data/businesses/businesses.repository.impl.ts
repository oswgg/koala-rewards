import { Business, CreateBusinessInput } from '@koalacards/loyalty/core/domain/types/business';
import { BusinessesRemoteDataSource } from './remote/businesses.remote.datasource.interface';
import { BusinessesRepository } from '@koalacards/loyalty/core/domain/repositories/businesses.repo.interface';

export class BusinessesRepositoryImpl implements BusinessesRepository {
    constructor(private readonly remote: BusinessesRemoteDataSource) {}

    async create(input: CreateBusinessInput): Promise<Business> {
        return await this.remote.create(input);
    }
}
