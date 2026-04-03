import {
    calculateEarnedAmount,
    calculateNewBalance,
} from '@koalacards/loyalty/core/domain/activities/balance';
import {
    EARN_PER_DAY_LIMIT_MESSAGE,
    RegisterEarnActivityError,
    RegisterEarnErrorType,
} from '@koalacards/loyalty/core/domain/activities/register-activity-errors';
import {
    RegisterEarnActivityInput,
    RegisterEarnActivityResult,
    RegisterRedeemActivityInput,
    RegisterRedeemActivityResult,
} from '@koalacards/loyalty/core/domain/types/activity';
import { StoredLoyaltyProgram } from '@koalacards/loyalty/core/domain/types/loyalty-program';
import { utcDayBoundsIso } from '@koalacards/loyalty/core/domain/activities/earn-limit';
import { isRewardReady } from '@koalacards/loyalty/core/lib/reward';
import type { MembershipActivitiesRemoteDataSource } from './membership-activities.remote.datasource.interface';
import { SupabaseClient } from '@supabase/supabase-js';

async function hasEarnActivityToday(
    supabase: SupabaseClient,
    membershipId: string
): Promise<boolean> {
    const { startIso, endIso } = utcDayBoundsIso();

    const { data, error } = await supabase
        .from('card_activity')
        .select('id')
        .eq('membership_id', membershipId)
        .eq('type', 'earn')
        .gte('registered_at', startIso)
        .lt('registered_at', endIso)
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return Boolean(data?.id);
}

export class SupabaseMembershipActivitiesRemoteDataSource implements MembershipActivitiesRemoteDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async registerEarnActivity(
        input: RegisterEarnActivityInput,
        staffId: number
    ): Promise<RegisterEarnActivityResult> {
        const { data: membership, error: membershipError } = await this.supabase
            .from('program_memberships')
            .select('balance')
            .eq('id', input.membershipId)
            .single();

        if (membershipError || !membership) {
            throw membershipError ?? new Error('Membership not found');
        }

        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('*')
            .eq('id', input.programId)
            .single();

        if (programError || !program) {
            throw programError ?? new Error('Program not found');
        }

        const programTyped = program as StoredLoyaltyProgram;

        if (programTyped.limit_one_per_day) {
            const alreadyEarned = await hasEarnActivityToday(this.supabase, input.membershipId);
            if (alreadyEarned) {
                throw new RegisterEarnActivityError(
                    RegisterEarnErrorType.EARN_PER_DAY_LIMIT_ERROR,
                    EARN_PER_DAY_LIMIT_MESSAGE
                );
            }
        }

        const currentBalance = Number(membership.balance);
        const earnedAmount = calculateEarnedAmount(programTyped, input);
        const newBalance = calculateNewBalance(currentBalance, programTyped, input);

        const { error: insertError } = await this.supabase.from('card_activity').insert({
            membership_id: input.membershipId,
            program_id: input.programId,
            type: input.type,
            quantity: earnedAmount,
            purchase_amount: input.purchaseAmount,
            registered_by_staff_id: staffId,
        });

        if (insertError) throw insertError;

        const { error: updateError } = await this.supabase
            .from('program_memberships')
            .update({ balance: newBalance })
            .eq('id', input.membershipId);

        if (updateError) throw updateError;

        return { earnedAmount, newBalance };
    }

    async registerRedeemActivity(
        input: RegisterRedeemActivityInput,
        staffId: number
    ): Promise<RegisterRedeemActivityResult> {
        const { data: membership, error: membershipError } = await this.supabase
            .from('program_memberships')
            .select('balance')
            .eq('id', input.membershipId)
            .single();

        if (membershipError || !membership) {
            throw membershipError ?? new Error('Membership not found');
        }

        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('*')
            .eq('id', input.programId)
            .single();

        if (programError || !program) {
            throw programError ?? new Error('Program not found');
        }

        const programTyped = program as StoredLoyaltyProgram;
        const currentBalance = Number(membership.balance);

        if (programTyped.type === 'cashback') {
            if (!input.cashbackApplyAll) {
                throw new Error('Programa cashback: usa aplicar cashback para registrar el canje');
            }
            if (currentBalance <= 0) {
                throw new Error('No hay cashback acumulado para aplicar');
            }

            const redeemedAmount = currentBalance;
            const newBalance = 0;

            const { error: insertError } = await this.supabase.from('card_activity').insert({
                membership_id: input.membershipId,
                program_id: input.programId,
                type: 'redeem',
                quantity: redeemedAmount,
                purchase_amount: null,
                registered_by_staff_id: staffId,
            });

            if (insertError) throw insertError;

            const { error: updateError } = await this.supabase
                .from('program_memberships')
                .update({ balance: newBalance })
                .eq('id', input.membershipId);

            if (updateError) throw updateError;

            return { newBalance, redeemedAmount };
        }

        const rewardCost = programTyped.reward_cost ?? 0;

        if (
            !isRewardReady({
                programType: programTyped.type,
                rewardCost,
                balance: currentBalance,
            })
        ) {
            throw new Error('El cliente no tiene saldo suficiente para canjear la recompensa');
        }

        const newBalance = currentBalance - rewardCost;

        const { error: insertError } = await this.supabase.from('card_activity').insert({
            membership_id: input.membershipId,
            program_id: input.programId,
            type: 'redeem',
            quantity: rewardCost,
            purchase_amount: null,
            registered_by_staff_id: staffId,
        });

        if (insertError) throw insertError;

        const { error: updateError } = await this.supabase
            .from('program_memberships')
            .update({ balance: newBalance })
            .eq('id', input.membershipId);

        if (updateError) throw updateError;

        return { newBalance, redeemedAmount: rewardCost };
    }
}
