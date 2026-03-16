/**
 * Callback cuando cambia el balance de una membresía.
 */
export type OnMembershipBalanceChange = (membershipId: string, newBalance: number) => void;

/**
 * Callback cuando el cliente canjea una recompensa (actividad tipo redeem).
 */
export type OnRedeem = (membershipId: string) => void;

export interface MembershipsRealtimeSubscribeOptions {
    onBalanceChange: OnMembershipBalanceChange;
    /** Se llama cuando se detecta un canje de recompensa en una membresía del usuario */
    onRedeem?: OnRedeem;
    /** IDs de membresías del usuario, para filtrar eventos de redeem */
    membershipIds?: string[];
}

/**
 * Servicio para suscribirse a cambios en tiempo real del balance de membresías
 * y a canjes de recompensa (card_activity tipo redeem).
 */
export interface MembershipsRealtimeService {
    /**
     * Suscribe a cambios de balance y canjes de recompensa.
     * @param userId ID del usuario
     * @param options Callbacks y opciones
     * @returns Función para cancelar la suscripción
     */
    subscribe(
        userId: string,
        options: MembershipsRealtimeSubscribeOptions
    ): () => void;
}
