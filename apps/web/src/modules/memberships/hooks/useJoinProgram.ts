import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipRepository } from '@/infrastructure';
import { ProgramSnapshot } from '@koalacards/loyalty';

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
            membershipRepository.createByProgramPublicId(programPublicId, userId, programSnapshot),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
        },
    });
}
