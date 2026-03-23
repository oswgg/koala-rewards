import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
    RegisterRedeemActivityResult,
} from '../../types/activity';

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
