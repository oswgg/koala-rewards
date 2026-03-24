export { utcDayBoundsIso } from '@koalacards/core/src/domain/activities/earn-limit';

export const earnTodayQueryKey = (membershipId: string) => ['earn-today', membershipId] as const;
