import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
    RegisterRedeemActivityResult,
} from '@koalacards/loyalty/core/domain/types/activity';

export interface MembershipActivitiesRemoteDataSource {
    registerEarnActivity(
        input: RegisterEarnActivityInput,
        staffId: number
    ): Promise<RegisterEarnActivityResult>;

    registerRedeemActivity(
        input: RegisterRedeemActivityInput,
        staffId: number
    ): Promise<RegisterRedeemActivityResult>;
}
