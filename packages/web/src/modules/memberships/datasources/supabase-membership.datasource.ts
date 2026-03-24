import { createClient } from '@/infrastructure/supabase/client';
import { SupabaseMembershipDataSource as CoreSupabaseMembershipDataSource } from '@koalacards/core/src/datasources/memberships/membership-datasource.supabase';

export class SupabaseMembershipDataSource extends CoreSupabaseMembershipDataSource {
    constructor() {
        super(createClient);
    }
}
