import { Business, CreateBusinessInput } from '@koalacards/loyalty/core/domain/types/business';
import { BusinessesRemoteDataSource } from '@koalacards/loyalty/data/businesses/remote/businesses.remote.datasource.interface';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseBusinessesRemoteDataSource implements BusinessesRemoteDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async create(input: CreateBusinessInput): Promise<Business> {
        const { data, error } = await this.supabase
            .from('businesses')
            .insert({
                name: input.name,
                slug: input.slug,
            })
            .select('*')
            .single();

        if (error) throw error;
        return data as Business;
    }
}
