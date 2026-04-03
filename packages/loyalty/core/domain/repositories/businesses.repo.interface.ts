import { Business, CreateBusinessInput } from '../types/business';

export interface BusinessesRepository {
    create(input: CreateBusinessInput): Promise<Business>;
}
