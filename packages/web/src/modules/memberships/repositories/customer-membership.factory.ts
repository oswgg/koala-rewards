import { CustomerMembershipRepositoryImpl } from '@koalacards/core/src/repositories/customer-membership.impl';
import { SupabaseMembershipDataSource } from '../datasources/supabase-membership.datasource';
import { DexieMembershipDataSource } from '../datasources/dexie-membership.datasource';

const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

export const customerMembershipRepository = new CustomerMembershipRepositoryImpl(
    new SupabaseMembershipDataSource(),
    new DexieMembershipDataSource(),
    isOnline
);
