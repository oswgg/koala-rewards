import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
} from '@/shared/types/activity';

export interface RegisterRedeemActivityResult {
    /** Nuevo balance tras canjear la recompensa */
    newBalance: number;
}

export interface CardActivityService {
    registerEarnActivity(
        input: RegisterEarnActivityInput,
        staffId: number
    ): Promise<RegisterEarnActivityResult>;

    registerRedeemActivity(
        input: RegisterRedeemActivityInput,
        staffId: number
    ): Promise<RegisterRedeemActivityResult>;
}
