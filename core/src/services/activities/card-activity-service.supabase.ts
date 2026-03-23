import type { SupabaseClient } from '@supabase/supabase-js';
import type { CardActivityService } from './card-activity-service.interface';
import type { MembershipService } from '../memberships/membership-service.interface';
import type { StoredLoyaltyProgram } from '../../types/loyalty-program';
import type { RegisterEarnActivityInput, RegisterRedeemActivityInput } from '../../types/activity';
import { calculateEarnedAmount, calculateNewBalance } from '../../domain/activities/balance';
import { isRewardReady } from '../../lib/reward';
import {
    EARN_PER_DAY_LIMIT_MESSAGE,
    RegisterEarnActivityError,
    RegisterEarnErrorType,
} from '../../domain/activities/register-activity-errors';

export function createSupabaseCardActivityService(
    getClient: () => SupabaseClient,
    membershipService: MembershipService
): CardActivityService {
    return {
        registerEarnActivity: async (input: RegisterEarnActivityInput, staffId: number) => {
            const supabase = getClient();

            const { data: membership, error: membershipError } = await supabase
                .from('program_memberships')
                .select('balance')
                .eq('id', input.membershipId)
                .single();

            if (membershipError || !membership)
                throw membershipError ?? new Error('Membership not found');

            const { data: program, error: programError } = await supabase
                .from('loyalty_programs')
                .select('*')
                .eq('id', input.programId)
                .single();

            if (programError || !program) throw programError ?? new Error('Program not found');

            const programTyped = program as StoredLoyaltyProgram;

            if (programTyped.limit_one_per_day) {
                const alreadyEarned = await membershipService.hasEarnActivityToday(
                    input.membershipId
                );
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

            const { error: insertError } = await supabase.from('card_activity').insert({
                membership_id: input.membershipId,
                program_id: input.programId,
                type: input.type,
                quantity: earnedAmount,
                purchase_amount: input.purchaseAmount,
                registered_by_staff_id: staffId,
            });

            if (insertError) throw insertError;

            const { error: updateError } = await supabase
                .from('program_memberships')
                .update({ balance: newBalance })
                .eq('id', input.membershipId);

            if (updateError) throw updateError;

            return { earnedAmount, newBalance };
        },

        registerRedeemActivity: async (input: RegisterRedeemActivityInput, staffId: number) => {
            const supabase = getClient();

            const { data: membership, error: membershipError } = await supabase
                .from('program_memberships')
                .select('balance')
                .eq('id', input.membershipId)
                .single();

            if (membershipError || !membership)
                throw membershipError ?? new Error('Membership not found');

            const { data: program, error: programError } = await supabase
                .from('loyalty_programs')
                .select('*')
                .eq('id', input.programId)
                .single();

            if (programError || !program) throw programError ?? new Error('Program not found');

            const programTyped = program as StoredLoyaltyProgram;
            const currentBalance = Number(membership.balance);

            if (programTyped.type === 'cashback') {
                if (!input.cashbackApplyAll) {
                    throw new Error(
                        'Programa cashback: usa aplicar cashback para registrar el canje'
                    );
                }
                if (currentBalance <= 0) {
                    throw new Error('No hay cashback acumulado para aplicar');
                }

                const redeemedAmount = currentBalance;
                const newBalance = 0;

                const { error: insertError } = await supabase.from('card_activity').insert({
                    membership_id: input.membershipId,
                    program_id: input.programId,
                    type: 'redeem',
                    quantity: redeemedAmount,
                    purchase_amount: null,
                    registered_by_staff_id: staffId,
                });

                if (insertError) throw insertError;

                const { error: updateError } = await supabase
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
                    rewardCost: rewardCost,
                    balance: currentBalance,
                })
            ) {
                throw new Error('El cliente no tiene saldo suficiente para canjear la recompensa');
            }

            const newBalance = currentBalance - rewardCost;

            const { error: insertError } = await supabase.from('card_activity').insert({
                membership_id: input.membershipId,
                program_id: input.programId,
                type: 'redeem',
                quantity: rewardCost,
                purchase_amount: null,
                registered_by_staff_id: staffId,
            });

            if (insertError) throw insertError;

            const { error: updateError } = await supabase
                .from('program_memberships')
                .update({ balance: newBalance })
                .eq('id', input.membershipId);

            if (updateError) throw updateError;

            return { newBalance, redeemedAmount: rewardCost };
        },
    };
}
