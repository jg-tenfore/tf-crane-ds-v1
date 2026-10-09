import type { ReactNode } from "react";
import { Award03, Gift01 } from "@untitledui/icons";
import { StatusBadge, type StatusTone } from "@/components/base/badge";
import { IconTile } from "@/components/base/card";
import { ProgressBar } from "@/components/base/progress-bar";
import { currency, formatDate, walletStatus, type GiftCard, type Membership, type PunchCard, type RainCheck, type WalletStatus } from "@/data/crane";
import { cx } from "@/utils/cx";

const STATUS: Record<WalletStatus, { label: string; tone: StatusTone }> = {
    active: { label: "Active", tone: "success" },
    available: { label: "Available", tone: "success" },
    "used-up": { label: "Used Up", tone: "gray" },
    expired: { label: "Expired", tone: "error" },
    "expiring-soon": { label: "Expiring Soon", tone: "warning" },
};

const Status = ({ status }: { status: WalletStatus }) => <StatusBadge tone={STATUS[status].tone}>{STATUS[status].label}</StatusBadge>;

/** White card with a title row (title, expiry, status) over a hairline and a body. */
const ItemCard = ({ title, subtitle, status, children }: { title: ReactNode; subtitle: ReactNode; status: WalletStatus; children: ReactNode }) => (
    <article className="overflow-hidden rounded-ios-card bg-primary shadow-ios-card ring-1 ring-secondary/60">
        <header className="flex items-start gap-3 px-4 pt-3.5 pb-3">
            <div className="min-w-0 flex-1">
                <h2 className="text-ios-headline text-primary">{title}</h2>
                <p className="text-ios-footnote text-tertiary">{subtitle}</p>
            </div>
            <Status status={status} />
        </header>
        <div className="border-t border-secondary px-4 pt-3.5 pb-4">{children}</div>
    </article>
);

/** Punch card: one progress bar per punchable product. */
export const PunchCardItem = ({ card }: { card: PunchCard }) => {
    const remaining = card.items.some((i) => i.used < i.total);
    const status = walletStatus({ expires: card.expires, used: remaining ? 0 : 1, total: 1 });
    return (
        <ItemCard title={`Punch Card #${card.number}`} subtitle={`Expires: ${formatDate(card.expires)}`} status={status}>
            <div className="flex flex-col gap-4">
                {card.items.map((i) => (
                    <ProgressBar key={i.name} label={i.name} value={i.used} max={i.total} valueLabel={`${i.used}/${i.total} used`} />
                ))}
            </div>
        </ItemCard>
    );
};

/** Rain check: remaining balance with how much has been spent. */
export const RainCheckItem = ({ check }: { check: RainCheck }) => {
    const status = walletStatus({ expires: check.expires, used: check.used, total: check.amount });
    return (
        <ItemCard title={`Rain Check #${check.number}`} subtitle={`Expires: ${formatDate(check.expires)}`} status={status}>
            <ProgressBar
                label={`Balance: ${currency(check.amount - check.used)} of ${currency(check.amount)}`}
                value={check.used}
                max={check.amount}
                valueLabel={`${currency(check.used)} used`}
            />
        </ItemCard>
    );
};

/** Gift card: code, balance, what it can be spent on. Expired/used cards are dimmed. */
export const GiftCardItem = ({ card }: { card: GiftCard }) => {
    const s = walletStatus({ expires: card.expires, used: card.used, total: card.amount });
    const status: WalletStatus = s === "active" || s === "expiring-soon" ? "available" : s;
    const dim = status !== "available";
    return (
        <article className="flex gap-3 rounded-ios-card bg-primary p-4 shadow-ios-card ring-1 ring-secondary/60">
            <IconTile icon={Gift01} size="lg" className={cx(dim && "opacity-60")} />
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <div className={cx("min-w-0 flex-1", dim && "opacity-60")}>
                        <h2 className="text-ios-headline text-primary">Gift Card</h2>
                        <p className="truncate text-ios-subheadline text-tertiary">Code: {card.code}</p>
                    </div>
                    <Status status={status} />
                </div>
                <div className={cx(dim && "opacity-60")}>
                    <p className="mt-1.5 text-ios-body text-secondary">
                        Balance: <span className="text-ios-title3 font-bold text-brand-secondary tabular-nums">{currency(card.amount - card.used)}</span>
                    </p>
                    {card.used > 0 && (
                        <p className="text-ios-footnote text-tertiary tabular-nums">
                            Original: <span className="font-semibold text-secondary">{currency(card.amount)}</span> | Used:{" "}
                            <span className="font-semibold text-secondary">{currency(card.used)}</span>
                        </p>
                    )}
                    <ul aria-label="Can be used for" className="mt-2.5 flex flex-wrap gap-1.5">
                        {card.categories.map((c) => (
                            <li key={c} className="rounded-md bg-tertiary px-2 py-0.5 text-ios-caption1 text-secondary">
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </article>
    );
};

/** Membership: name, member ID and expiry; flags memberships ending within 30 days. */
export const MembershipItem = ({ membership: m }: { membership: Membership }) => (
    <article className="flex gap-3 rounded-ios-card bg-primary p-4 shadow-ios-card ring-1 ring-secondary/60">
        <IconTile icon={Award03} size="lg" />
        <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
                <h2 className="min-w-0 flex-1 text-ios-headline text-primary">{m.name}</h2>
                <Status status={walletStatus({ expires: m.expires })} />
            </div>
            <p className="text-ios-subheadline text-tertiary">ID: {m.memberId}</p>
            <p className="mt-1.5 text-ios-subheadline text-tertiary">
                Expires: <span className="font-semibold text-primary">{formatDate(m.expires)}</span>
            </p>
        </div>
    </article>
);
