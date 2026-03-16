import { useMutation } from '@tanstack/react-query';
import { membershipService } from '../services/implementation.membership-service';

export function useJoinProgram() {
    return useMutation({
        mutationFn: async ({
            programId,
            userId,
        }: {
            programId: string;
            userId: string;
        }) => membershipService.create(programId, userId),
    });
}
