import type { ReactNode } from "react";
import { Award03, CloudRaining01, Gift01, Ticket01 } from "@untitledui/icons";
import { IconTile } from "@/components/base/card";
import { ProgressBar } from "@/components/base/progress-bar";
import { currency, formatDate, walletStatus, type GiftCard, type Membership, type PunchCard, type RainCheck, type WalletStatus } from "@/data/crane";
import { cx } from "@/utils/cx";
import { WalletStatusBadge } from "./account-ui";

/**
 * Web versions of the mobile wallet cards (src/screens/profile/wallet-cards.tsx): same
 * data, statuses and progress, laid out for a grid and set in web type sizes.
 */

const ItemCard = ({
    icon,
    title,
    subtitle,
    status,
    children,
    action,
    dim,
}: {
    icon: typeof Gift01;
    title: ReactNode;
    subtitle: ReactNode;
    status: WalletStatus;
    children?: ReactNode;
    action?: ReactNode;
    dim?: boolean;
}) => (
    <article className="flex flex-col rounded-xl bg-primary ring-1 ring-secondary ring-inset">
        <header className="flex items-start gap-3 p-4 pb-3">
            <IconTile icon={icon} className={cx(dim && "opacity-60")} />
            <div className={cx("min-w-0 flex-1", dim && "opacity-60")}>
                <h4 className="text-md font-semibold text-primary @tablet:truncate">{title}</h4>
                <p className="truncate text-sm text-tertiary">{subtitle}</p>
            </div>
            <WalletStatusBadge status={status} />
        </header>
        {children && <div className={cx("flex-1 border-t border-secondary px-4 py-3.5", dim && "opacity-60")}>{children}</div>}
        {action && <footer className="flex justify-end gap-2 border-t border-secondary px-4 py-3">{action}</footer>}
    </article>
);

/** One labelled meter row: "Green Fees · 3/20 used". */
const Meter = ({ label, value, max, valueLabel }: { label: ReactNode; value: number; max: number; valueLabel: ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-secondary">{label}</span>
            <span className="text-tertiary tabular-nums">{valueLabel}</span>
        </div>
        <ProgressBar aria-label={typeof label === "string" ? label : "Used"} value={value} max={max} />
    </div>
);

export const punchCardStatus = (card: PunchCard): WalletStatus => {
    const remaining = card.items.some((i) => i.used < i.total);
    return walletStatus({ expires: card.expires, used: remaining ? 0 : 1, total: 1 });
};

export const PunchCardTile = ({ card, action }: { card: PunchCard; action?: ReactNode }) => (
    <ItemCard icon={Ticket01} title={`Punch Card #${card.number}`} subtitle={`Expires ${formatDate(card.expires)}`} status={punchCardStatus(card)} action={action}>
        <div className="flex flex-col gap-3">
            {card.items.map((i) => (
                <Meter key={i.name} label={i.name} value={i.used} max={i.total} valueLabel={`${i.total - i.used} of ${i.total} left`} />
            ))}
        </div>
    </ItemCard>
);

export const rainCheckStatus = (c: RainCheck) => walletStatus({ expires: c.expires, used: c.used, total: c.amount });

export const RainCheckTile = ({ check }: { check: RainCheck }) => {
    const status = rainCheckStatus(check);
    return (
        <ItemCard icon={CloudRaining01} title={`Rain Check #${check.number}`} subtitle={`Expires ${formatDate(check.expires)}`} status={status} dim={status === "used-up" || status === "expired"}>
            <Meter
                label={
                    <>
                        <span className="text-lg font-semibold text-primary tabular-nums">{currency(check.amount - check.used)}</span>
                        <span className="text-tertiary"> of {currency(check.amount)}</span>
                    </>
                }
                value={check.used}
                max={check.amount}
                valueLabel={`${currency(check.used)} used`}
            />
        </ItemCard>
    );
};

export const giftCardStatus = (card: GiftCard): WalletStatus => {
    const s = walletStatus({ expires: card.expires, used: card.used, total: card.amount });
    return s === "active" || s === "expiring-soon" ? "available" : s;
};

export const GiftCardTile = ({ card }: { card: GiftCard }) => {
    const status = giftCardStatus(card);
    const dim = status !== "available";
    return (
        <ItemCard icon={Gift01} title="Gift Card" subtitle={`Code ${card.code}`} status={status} dim={dim}>
            <p className="text-sm text-tertiary">
                Balance <span className="ml-1 text-lg font-semibold text-brand-secondary tabular-nums">{currency(card.amount - card.used)}</span>
                {card.used > 0 && <span className="tabular-nums"> · of {currency(card.amount)}</span>}
            </p>
            <p className="text-sm text-tertiary">{dim ? `Ended ${formatDate(card.expires)}` : `Expires ${formatDate(card.expires)}`}</p>
            <ul aria-label="Can be used for" className="mt-2.5 flex flex-wrap gap-1.5">
                {card.categories.map((c) => (
                    <li key={c} className="rounded-md bg-tertiary px-2 py-0.5 text-xs font-medium text-secondary">
                        {c}
                    </li>
                ))}
            </ul>
        </ItemCard>
    );
};

export const MembershipTile = ({ membership: m, action }: { membership: Membership; action?: ReactNode }) => (
    <ItemCard icon={Award03} title={m.name} subtitle={`Member ID ${m.memberId}`} status={walletStatus({ expires: m.expires })} action={action}>
        <p className="text-sm text-tertiary">
            {walletStatus({ expires: m.expires }) === "expired" ? "Ended" : "Expires"} <span className="font-semibold text-primary">{formatDate(m.expires)}</span>
        </p>
    </ItemCard>
);
