import { Business, CreateBusinessInput } from '@koalacards/loyalty/core';
import { BusinessesRemoteDataSource } from '@koalacards/loyalty/data/businesses/remote/businesses.remote.datasource.interface';
import { BusinessesRepository } from '@koalacards/loyalty/core/domain/repositories/businesses.repo.interface';

export class BusinessesRepositoryImpl implements BusinessesRepository {
    constructor(private readonly remote: BusinessesRemoteDataSource) {}

    async create(input: CreateBusinessInput): Promise<Business> {
        return await this.remote.create(input);
    }
}
