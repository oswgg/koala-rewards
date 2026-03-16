import { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';
import { CARD_THEMES, MemberShipCardDetailView } from './mermbership-card-detail';
import { buildCustomerQRValue } from '@/shared/lib/qr-data';

/**
 * Vista expandida de tarjeta con QR.
 * Usada en: wallet (cliente) y listado de programas (business).
 */
export function DetailedCard({
    membership,
    index,
    onClose,
    isBalanceJustChanged = false,
}: {
    membership: MembershipWithProgram;
    index: number;
    onClose: () => void;
    isBalanceJustChanged?: boolean;
}) {
    const theme = CARD_THEMES[index % CARD_THEMES.length];
    const qrValue = buildCustomerQRValue(
        membership.membership_client_id,
        membership.program_id,
        membership.user_id
    );

    return (
        <MemberShipCardDetailView
            program={membership.program}
            balance={membership.balance}
            qrUrl={qrValue}
            theme={theme}
            variant="customer"
            onClose={onClose}
            size="lg"
            isBalanceJustChanged={isBalanceJustChanged}
        />
    );
}
