import type { MembershipWithProgram } from '../services/interface.membership-service';
import type { Business } from '@/shared/types/business';
import type {
    LocalMembership,
    ProgramSnapshot,
    RemoteMembershipDataSource,
    LocalMembershipDataSource,
} from '../datasources/types.membership-datasource';
import type { JoinProgramResult } from './customer-membership.repo-interface';
import { CustomerMembershipRepository } from './customer-membership.repo-interface';

function toBusiness(b: ProgramSnapshot['business'], fallbackCreatedAt: string): Business {
    return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        created_at: (b as Partial<Business>).created_at ?? fallbackCreatedAt,
    };
}

function toMembershipWithProgram(local: LocalMembership): MembershipWithProgram {
    const program = local.program;
    if (!program) {
        throw new Error('Local membership missing program snapshot for display');
    }
    return {
        id: local.remote_id ?? local.id,
        program_id: local.program_id,
        user_id: local.user_id,
        balance: local.balance,
        created_at: local.created_at,
        public_id: local.public_id ?? '',
        business: toBusiness(program.business, local.created_at),
        program: {
            id: program.id,
            public_id: program.public_id,
            name: program.name,
            type: program.type,
            reward_description: program.reward_description,
            reward_cost: program.reward_cost,
            cashback_percentage: program.cashback_percentage,
            points_percentage: program.points_percentage,
            card_theme: program.card_theme as MembershipWithProgram['program']['card_theme'],
            business: toBusiness(program.business, local.created_at),
            business_id: program.business.id,
            created_at: local.created_at,
            is_active: true,
            limit_one_per_day: false,
        } as MembershipWithProgram['program'],
    };
}

export class CustomerMembershipRepositoryImpl implements CustomerMembershipRepository {
    constructor(
        private readonly remote: RemoteMembershipDataSource,
        private readonly local: LocalMembershipDataSource,
        private readonly isOnline: () => boolean = () =>
            typeof navigator !== 'undefined' && navigator.onLine
    ) {}

    async create(
        programId: string,
        userId: string,
        programSnapshot?: ProgramSnapshot
    ): Promise<MembershipWithProgram> {
        const localMembership: LocalMembership = {
            id: `local_${programId}_${userId}`,
            program_id: programId,
            user_id: userId,
            balance: 0,
            created_at: new Date().toISOString(),
            syncStatus: 'pending',
            program: programSnapshot,
        };

        const saved = await this.local.save(localMembership);

        if (this.isOnline()) {
            this.syncRecord(saved).catch(() => {});
        }

        return toMembershipWithProgram(saved);
    }

    async createByProgramPublicId(
        programPublicId: string,
        userId: string,
        programSnapshot: ProgramSnapshot
    ): Promise<JoinProgramResult> {
        const localMembership: LocalMembership = {
            id: `local_${programPublicId}_${userId}`,
            program_id: programPublicId,
            program_public_id: programPublicId,
            user_id: userId,
            balance: 0,
            created_at: new Date().toISOString(),
            syncStatus: 'pending',
            program: programSnapshot,
        };

        const saved = await this.local.save(localMembership);
        let createdOffline = true;

        if (this.isOnline()) {
            this.syncRecord(saved).catch(() => {});
            createdOffline = false;
        }

        return {
            membership: toMembershipWithProgram(saved),
            createdOffline,
        };
    }

    async hasMembership(programId: string, userId: string): Promise<boolean> {
        const localHas = await this.local.hasMembership(programId, userId);
        if (localHas) return true;
        if (!this.isOnline()) return false;
        return this.remote.hasMembership(programId, userId);
    }

    async hasMembershipByProgramPublicId(
        programPublicId: string,
        userId: string
    ): Promise<boolean> {
        const localHas = await this.local.hasMembershipByProgramPublicId(programPublicId, userId);
        if (localHas) return true;
        if (!this.isOnline()) return false;
        return this.remote.hasMembershipByProgramPublicId(programPublicId, userId);
    }

    async getByUserId(userId: string): Promise<MembershipWithProgram[]> {
        const [localResult, remoteResult] = await Promise.allSettled([
            this.local.getByUserId(userId),
            this.isOnline() ? this.remote.getByUserId(userId) : Promise.resolve([]),
        ]);

        const local = localResult.status === 'fulfilled' ? localResult.value : [];
        const remote = remoteResult.status === 'fulfilled' ? remoteResult.value : [];

        const remoteKeys = new Set(remote.map((r) => `${r.program_id}_${r.user_id}`));
        const remotePublicIds = new Set(remote.map((r) => r.program.public_id));
        const localKeys = new Set(local.map((l) => `${l.program_id}_${l.user_id}`));

        const isInRemote = (l: LocalMembership) =>
            remoteKeys.has(`${l.program_id}_${l.user_id}`) ||
            (l.program_public_id != null && remotePublicIds.has(l.program_public_id));

        if (this.isOnline()) {
            const syncedNotInRemote = local.filter(
                (l) => l.syncStatus === 'synced' && !isInRemote(l)
            );
            for (const l of syncedNotInRemote) {
                await this.local.delete(l.program_id, l.user_id);
            }

            const remoteNotInLocal = remote.filter(
                (r) =>
                    !localKeys.has(`${r.program_id}_${r.user_id}`) &&
                    !local.some(
                        (l) =>
                            l.program_public_id === r.program.public_id && l.user_id === r.user_id
                    )
            );
            for (const r of remoteNotInLocal) {
                const localMembership: LocalMembership = {
                    id: `local_${r.program_id}_${r.user_id}`,
                    program_id: r.program_id,
                    user_id: r.user_id,
                    balance: r.balance,
                    created_at: r.created_at,
                    public_id: r.public_id,
                    remote_id: r.id,
                    syncStatus: 'synced',
                    program: {
                        id: r.program.id,
                        public_id: r.program.public_id,
                        name: r.program.name,
                        type: r.program.type,
                        reward_description: r.program.reward_description ?? '',
                        reward_cost: r.program.reward_cost,
                        cashback_percentage: r.program.cashback_percentage,
                        points_percentage: r.program.points_percentage,
                        card_theme: r.program.card_theme,
                        business: r.program.business,
                    },
                };
                await this.local.save(localMembership);
            }
        }

        // If offline, return all local memberships
        if (!this.isOnline()) {
            const allLocalWithProgram = local.filter((l) => l.program).map(toMembershipWithProgram);
            return allLocalWithProgram;
        }

        // If online, filter only the local memberships that are not in remote
        // Remote memberships are already shown in the list
        const onlyLocal = local.filter((l) => !isInRemote(l) && l.syncStatus !== 'synced');
        const localAsMemberships = onlyLocal.filter((l) => l.program).map(toMembershipWithProgram);

        return [...remote, ...localAsMemberships];
    }

    async syncPending(): Promise<void> {
        if (!this.isOnline()) return;
        const pending = await this.local.getPending();
        await Promise.allSettled(pending.map((m) => this.syncRecord(m)));
    }

    private async syncRecord(local: LocalMembership): Promise<void> {
        const lookupKey = local.program_public_id ?? local.program_id;

        try {
            await this.local.update(local.program_id, local.user_id, {
                syncStatus: 'syncing',
            });

            let remote: MembershipWithProgram;
            if (local.program_public_id) {
                remote = await this.remote.createByProgramPublicId(
                    local.program_public_id,
                    local.user_id
                );
            } else {
                try {
                    remote = await this.remote.create(local.program_id, local.user_id);
                } catch (createErr: unknown) {
                    const errObj = createErr as { code?: string; message?: string } | null;
                    const isDuplicate =
                        errObj &&
                        typeof errObj === 'object' &&
                        (errObj.code === '23505' ||
                            /unique|duplicate|23505/i.test(String(errObj.message ?? '')));

                    if (isDuplicate) {
                        const existing = await this.remote.getByProgramIdAndUserId(
                            local.program_id,
                            local.user_id
                        );
                        if (existing) {
                            remote = existing;
                        } else {
                            throw createErr;
                        }
                    } else {
                        throw createErr;
                    }
                }
            }

            await this.local.update(lookupKey, local.user_id, {
                program_id: remote.program_id,
                program_public_id: undefined,
                remote_id: remote.id,
                public_id: remote.public_id,
                balance: remote.balance,
                syncStatus: 'synced',
                syncError: undefined,
                program: {
                    id: remote.program.id,
                    public_id: remote.program.public_id,
                    name: remote.program.name,
                    type: remote.program.type,
                    reward_description: remote.program.reward_description ?? '',
                    reward_cost: remote.program.reward_cost,
                    cashback_percentage: remote.program.cashback_percentage,
                    points_percentage: remote.program.points_percentage,
                    card_theme: remote.program.card_theme,
                    business: remote.program.business,
                },
            });
        } catch (err) {
            await this.local.update(lookupKey, local.user_id, {
                syncStatus: 'error',
                syncError: String(err),
            });
        }
    }
}
