import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
    RegisterRedeemActivityResult,
} from '@koalacards/loyalty/core/domain/types/activity';
import type { MembershipActivitiesRemoteDataSource } from './remote/membership-activities.remote.datasource.interface';
import type { MembershipActivitiesRepository } from '@koalacards/loyalty/core/domain/repositories/membership-activities.repo.interface';

export class MembershipActivitiesRepositoryImpl implements MembershipActivitiesRepository {
    constructor(private readonly remote: MembershipActivitiesRemoteDataSource) {}

    async registerEarnActivity(
        input: RegisterEarnActivityInput,
        staffId: number
    ): Promise<RegisterEarnActivityResult> {
        return await this.remote.registerEarnActivity(input, staffId);
    }

    async registerRedeemActivity(
        input: RegisterRedeemActivityInput,
        staffId: number
    ): Promise<RegisterRedeemActivityResult> {
        return await this.remote.registerRedeemActivity(input, staffId);
    }
}
