// @koalacards/core - Platform-agnostic business logic

// Types
export * from './types/user';
export * from './types/business';
export * from './types/card-theme';
export * from './types/loyalty-program';
export * from './types/membership';
export * from './types/activity';

// Lib
export * from './lib/card-themes';
export * from './lib/slug';
export * from './lib/reward';
export * from './lib/qr-data';
export { toUser } from './lib/user-mapper';
export { getProfileIdByAuthUserId } from './lib/resolve-profile-id';

// Domain
export * from './domain/activities/balance';
export * from './domain/activities/register-activity-errors';
export * from './domain/activities/earn-limit';

// Service interfaces
export type { AuthService } from './services/auth/auth-service.interface';
export type { BusinessService } from './services/business/business-service.interface';
export type { ProgramsService } from './services/programs/programs-service.interface';
export type { MembershipWithProgram, MembershipService } from './services/memberships/membership-service.interface';
export type { MembershipsRealtimeService, MembershipsRealtimeSubscribeOptions, OnMembershipBalanceChange, OnRedeem } from './services/memberships/memberships-realtime-service.interface';
export type { CardActivityService } from './services/activities/card-activity-service.interface';
export type { BusinessProfilesLookupService, ProfileByContact, CreateProfileAndMembershipsInput } from './services/profiles/profiles-lookup-service.interface';

// Datasource interfaces and types
export type { SyncStatus, ProgramSnapshot, LocalMembership, RemoteMembershipDataSource, LocalMembershipDataSource } from './datasources/memberships/membership-datasource.types';
export { SupabaseMembershipDataSource } from './datasources/memberships/membership-datasource.supabase';

// Repository interfaces
export type { JoinProgramResult, CustomerMembershipRepository } from './repositories/customer-membership.interface';

// Repository implementations
export { CustomerMembershipRepositoryImpl } from './repositories/customer-membership.impl';

// Service factories (Supabase implementations)
export { createSupabaseAuthService } from './services/auth/auth-service.supabase';
export { createSupabaseProgramsService } from './services/programs/programs-service.supabase';
export { createSupabaseMembershipService } from './services/memberships/membership-service.supabase';
export { createSupabaseMembershipsRealtimeService } from './services/memberships/memberships-realtime-service.supabase';
export { createSupabaseCardActivityService } from './services/activities/card-activity-service.supabase';
export { createSupabaseProfilesLookupService } from './services/profiles/profiles-lookup-service.supabase';
