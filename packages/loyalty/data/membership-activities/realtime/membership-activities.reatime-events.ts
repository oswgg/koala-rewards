export type MembershipActivitiesRealtimeEvent =
    | {
          type: 'EARN';
          membershipId: string;
          newBalance: number;
      }
    | {
          type: 'REDEEM';
          membershipId: string;
      };
