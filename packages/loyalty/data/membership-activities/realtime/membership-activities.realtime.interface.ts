import { MembershipActivitiesRealtimeEvent } from './membership-activities.reatime-events';

export type MembershipActivitiesRealtimeScope =
    | {
          type: 'CLIENT';
          profileId: string;
          membershipIds?: string[];
      }
    | {
          type: 'STAFF';
          businessId: string;
      };

export interface MembershipActivitiesRealtimeSubscription {
    unsubscribe(): void;
}

export interface MembershipActivitiesRealtimeService {
    subscribe(
        scope: MembershipActivitiesRealtimeScope,
        onEvent: (event: MembershipActivitiesRealtimeEvent) => void
    ): MembershipActivitiesRealtimeSubscription;
}
