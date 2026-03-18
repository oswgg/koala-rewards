import { CustomerMembershipRepositoryImpl } from './customer-membership.repo-impl';
import { SupabaseMembershipDataSource } from '../datasources/supabase-membership.datasource';
import { DexieMembershipDataSource } from '../datasources/dexie-membership.datasource';

export const customerMembershipRepository = new CustomerMembershipRepositoryImpl(
    new SupabaseMembershipDataSource(),
    new DexieMembershipDataSource()
);
