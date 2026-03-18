import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerMembershipRepository } from '../repositories/customer-membership.factory';
import type { ProgramSnapshot } from '../datasources/types.membership-datasource';

export function useJoinProgram() {
    const queryClient = useQueryClient();
    return useMutation({
        networkMode: 'always',
        mutationFn: async ({
            programPublicId,
            userId,
            programSnapshot,
        }: {
            programPublicId: string;
            userId: string;
            programSnapshot: ProgramSnapshot;
        }) =>
            customerMembershipRepository.createByProgramPublicId(
                programPublicId,
                userId,
                programSnapshot
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
        },
    });
}
