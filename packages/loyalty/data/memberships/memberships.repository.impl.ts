import { MembershipWithProgram, ProgramMembership } from '@koalacards/loyalty/core';
import {
    LocalMembership,
    LocalMembershipDataSource,
    ProgramSnapshot,
} from '@koalacards/loyalty/core/domain/types/membership-datasource.types';
import { Business } from '@koalacards/loyalty/core/domain/types/business';
import { MembershipsRemoteDataSource } from '@koalacards/loyalty/data/memberships/remote/memberships.remote.datasource.interface';
import {
    JoinProgramResult,
    MembershipsRepository,
} from '@koalacards/loyalty/core/domain/repositories/memberships.repo.interface';

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
        profile_id: local.profile_id ?? '',
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

function toProgramMembership(local: LocalMembership): ProgramMembership {
    return {
        id: local.remote_id ?? local.id,
        program_id: local.program_id,
        profile_id: local.profile_id ?? '',
        balance: local.balance,
        created_at: local.created_at,
        public_id: local.public_id ?? '',
        business: local.program
            ? toBusiness(local.program.business, local.created_at)
            : {
                  id: '',
                  name: '',
                  slug: '',
                  created_at: local.created_at,
              },
    };
}

export class MembershipsRepositoryImpl implements MembershipsRepository {
    constructor(
        private readonly remote: MembershipsRemoteDataSource,
        private readonly local: LocalMembershipDataSource,
        private readonly isOnline: () => boolean
    ) {}

    async create(programId: string, userId: string): Promise<ProgramMembership> {
        const localMembership: LocalMembership = {
            id: `local_${programId}_${userId}`,
            program_id: programId,
            user_id: userId,
            balance: 0,
            created_at: new Date().toISOString(),
            syncStatus: 'pending',
        };

        const saved = await this.local.save(localMembership);

        if (this.isOnline()) {
            this.syncRecord(saved).catch(() => {});
        }

        return toProgramMembership(saved);
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

        const remote = await this.remote.getByProgramPublicIdAndUserId(programPublicId, userId);
        return remote != null;
    }

    async getByUserId(userId: string): Promise<MembershipWithProgram[]> {
        const [localResult, remoteResult] = await Promise.allSettled([
            this.local.getByUserId(userId),
            this.isOnline() ? this.remote.getByUserId(userId) : Promise.resolve([]),
        ]);

        const local = localResult.status === 'fulfilled' ? localResult.value : [];
        const remote = remoteResult.status === 'fulfilled' ? remoteResult.value : [];

        const remoteKeys = new Set(remote.map((r) => `${r.program_id}_${r.profile_id}`));
        const remotePublicIds = new Set(remote.map((r) => r.program.public_id));
        const localKeys = new Set(
            local.map((l) =>
                l.profile_id != null
                    ? `${l.program_id}_${l.profile_id}`
                    : `${l.program_id}_auth_${l.user_id}`
            )
        );

        const isInRemote = (l: LocalMembership) =>
            (l.profile_id != null && remoteKeys.has(`${l.program_id}_${l.profile_id}`)) ||
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
                    !localKeys.has(`${r.program_id}_${r.profile_id}`) &&
                    !local.some(
                        (l) =>
                            l.program_public_id === r.program.public_id &&
                            l.user_id === userId &&
                            (l.profile_id === r.profile_id || l.profile_id == null)
                    )
            );

            for (const r of remoteNotInLocal) {
                const localMembership: LocalMembership = {
                    id: `local_${r.program_id}_${userId}`,
                    program_id: r.program_id,
                    user_id: userId,
                    profile_id: r.profile_id,
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

        if (!this.isOnline()) {
            return local.filter((l) => l.program).map(toMembershipWithProgram);
        }

        const onlyLocal = local.filter((l) => !isInRemote(l) && l.syncStatus !== 'synced');
        const localAsMemberships = onlyLocal.filter((l) => l.program).map(toMembershipWithProgram);

        return [...remote, ...localAsMemberships];
    }

    async getByPublicId(publicId: string): Promise<MembershipWithProgram | null> {
        if (!this.isOnline()) return null;
        return await this.remote.getByPublicId(publicId);
    }

    async getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const localByUser = await this.local.getByUserId(userId);
        const localMatch = localByUser.find(
            (m) => m.program_id === programId || m.program_public_id === programId
        );

        if (this.isOnline()) {
            const remote = await this.remote.getByProgramIdAndUserId(programId, userId);
            if (remote) return remote;
        }

        if (localMatch?.program) return toMembershipWithProgram(localMatch);
        return null;
    }

    async getByProgramIdAndProfileId(
        programId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        if (!this.isOnline()) return null;
        return await this.remote.getByProgramIdAndProfileId(programId, profileId);
    }

    async getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const localByUser = await this.local.getByUserId(userId);
        const localMatch = localByUser.find(
            (m) =>
                m.program_public_id === programPublicId ||
                m.program?.public_id === programPublicId ||
                m.program_id === programPublicId
        );

        if (this.isOnline()) {
            const remote = await this.remote.getByProgramPublicIdAndUserId(programPublicId, userId);
            if (remote) return remote;
        }

        if (localMatch?.program) return toMembershipWithProgram(localMatch);
        return null;
    }

    async getByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        if (!this.isOnline()) return null;
        return await this.remote.getByProgramPublicIdAndProfileId(programPublicId, profileId);
    }

    async createByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const localMembership: LocalMembership = {
            id: `local_${programPublicId}_${userId}`,
            program_id: programPublicId,
            program_public_id: programPublicId,
            user_id: userId,
            balance: 0,
            created_at: new Date().toISOString(),
            syncStatus: 'pending',
        };

        const saved = await this.local.save(localMembership);

        if (this.isOnline()) {
            this.syncRecord(saved).catch(() => {});
            const remote = await this.remote.getByProgramPublicIdAndUserId(programPublicId, userId);
            if (remote) return remote;
        }

        return saved.program ? toMembershipWithProgram(saved) : null;
    }

    async createByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        if (!this.isOnline()) return null;
        return await this.remote.createByProgramPublicIdAndProfileId(programPublicId, profileId);
    }

    async hasEarnActivityToday(membershipId: string): Promise<boolean> {
        if (!this.isOnline()) return false;
        return await this.remote.hasEarnActivityToday(membershipId);
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

            let remoteWithProgram: MembershipWithProgram | null = null;

            if (local.program_public_id) {
                try {
                    remoteWithProgram = await this.remote.createByProgramPublicIdAndUserId(
                        local.program_public_id,
                        local.user_id
                    );
                } catch (createErr: unknown) {
                    const errObj = createErr as { code?: string; message?: string } | null;
                    const isDuplicate =
                        errObj &&
                        typeof errObj === 'object' &&
                        (errObj.code === '23505' ||
                            /unique|duplicate|23505/i.test(String(errObj.message ?? '')));

                    if (!isDuplicate) throw createErr;
                }

                if (!remoteWithProgram) {
                    remoteWithProgram = await this.remote.getByProgramPublicIdAndUserId(
                        local.program_public_id,
                        local.user_id
                    );
                }
            } else {
                try {
                    await this.remote.create(local.program_id, local.user_id);
                } catch (createErr: unknown) {
                    const errObj = createErr as { code?: string; message?: string } | null;
                    const isDuplicate =
                        errObj &&
                        typeof errObj === 'object' &&
                        (errObj.code === '23505' ||
                            /unique|duplicate|23505/i.test(String(errObj.message ?? '')));

                    if (!isDuplicate) throw createErr;
                }

                remoteWithProgram = await this.remote.getByProgramIdAndUserId(
                    local.program_id,
                    local.user_id
                );
            }

            if (!remoteWithProgram) {
                throw new Error(
                    'No se pudo recuperar la membresia remota durante la sincronizacion'
                );
            }

            await this.local.update(lookupKey, local.user_id, {
                program_id: remoteWithProgram.program_id,
                program_public_id: undefined,
                remote_id: remoteWithProgram.id,
                public_id: remoteWithProgram.public_id,
                profile_id: remoteWithProgram.profile_id,
                balance: remoteWithProgram.balance,
                syncStatus: 'synced',
                syncError: undefined,
                program: {
                    id: remoteWithProgram.program.id,
                    public_id: remoteWithProgram.program.public_id,
                    name: remoteWithProgram.program.name,
                    type: remoteWithProgram.program.type,
                    reward_description: remoteWithProgram.program.reward_description ?? '',
                    reward_cost: remoteWithProgram.program.reward_cost,
                    cashback_percentage: remoteWithProgram.program.cashback_percentage,
                    points_percentage: remoteWithProgram.program.points_percentage,
                    card_theme: remoteWithProgram.program.card_theme,
                    business: remoteWithProgram.program.business,
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
