import { RegisterEarnActivityInput } from '@/shared/types/activity';
import { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

/**
 * Calcula lo que se suma en esta actividad (1 visita/sello, X puntos, o X$ cashback).
 */
export function calculateEarnedAmount(
    program: StoredLoyaltyProgram,
    input: RegisterEarnActivityInput
): number {
    switch (input.programType) {
        case 'stamps':
            return input.quantity;
        case 'points': {
            const amount = input.purchaseAmount ?? 0;
            return Math.round((amount * (program.points_percentage ?? 0)) / 100);
        }
        case 'cashback': {
            const amount = input.purchaseAmount ?? 0;
            return (amount * (program.cashback_percentage ?? 0)) / 100;
        }
        default:
            return 0;
    }
}

export function calculateNewBalance(
    currentBalance: number,
    program: StoredLoyaltyProgram,
    input: RegisterEarnActivityInput
): number {
    const earned = calculateEarnedAmount(program, input);
    return currentBalance + earned;
}
