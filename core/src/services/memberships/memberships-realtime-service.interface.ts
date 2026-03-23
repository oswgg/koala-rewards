export type OnMembershipBalanceChange = (membershipId: string, newBalance: number) => void;

export type OnRedeem = (membershipId: string) => void;

export interface MembershipsRealtimeSubscribeOptions {
    onBalanceChange: OnMembershipBalanceChange;
    /** Se llama cuando se detecta un canje de recompensa en una membresía del usuario */
    onRedeem?: OnRedeem;
    /** IDs de membresías del usuario, para filtrar eventos de redeem */
    membershipIds?: string[];
}

export interface MembershipsRealtimeService {
    subscribe(authUserId: string, options: MembershipsRealtimeSubscribeOptions): () => void;
}
