import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
    RegisterRedeemActivityResult,
    MembershipActivitiesRepository,
} from '@vado/loyalty/core';
import type { MembershipActivitiesRemoteDataSource } from './remote/membership-activities.remote.datasource.interface';

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
