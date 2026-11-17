import type { ReactNode } from "react";
import { Calendar, Ticket02, Users01 } from "@untitledui/icons";
import { StatusBadge, type StatusTone } from "@/components/base/badge";
import { cx } from "@/utils/cx";
import { CREDIT_TERM, INSTRUCTION_TODAY, money, packageById, type CreditBalance } from "../data";
import { CoachAvatar, CreditDots, MetaLine, MicroLabel, coachFor } from "./packages-ui";

export type BalanceStatus = "active" | "assigned" | "used-up" | "expired";

/** Active, assigned (Thrive import), used up, or expired with lessons still on it. */
export const balanceStatus = (b: CreditBalance): BalanceStatus => {
    if (b.creditsRemaining === 0) return "used-up";
    const exp = b.expiresOn ? new Date(b.expiresOn) : null;
    if (exp && !Number.isNaN(exp.getTime()) && exp < INSTRUCTION_TODAY) return "expired";
    return packageById(b.packageId)?.availability === "assigned" ? "assigned" : "active";
};

/** Can this balance still pay for a lesson? */
export const isUsable = (b: CreditBalance) => {
    const s = balanceStatus(b);
    return s === "active" || s === "assigned";
};

const STATUS: Record<BalanceStatus, { label: string; tone: StatusTone }> = {
    active: { label: "Active", tone: "success" },
    assigned: { label: "Assigned", tone: "gray" },
    "used-up": { label: "Used up", tone: "gray" },
    expired: { label: "Expired", tone: "error" },
};

/**
 * CreditBalanceCard — one balance in the golfer's credit wallet: the pack and instructor,
 * lessons remaining as dots, value remaining, purchased / expires / transferable, and the
 * redemption history. Read the other way it's the liability MCG still carries for that instructor.
 */
export const CreditBalanceCard = ({ balance, actions, highlight }: { balance: CreditBalance; actions?: ReactNode; highlight?: boolean }) => {
    const coach = coachFor(balance.coachId);
    const pack = packageById(balance.packageId);
    const status = balanceStatus(balance);
    const dim = status === "used-up" || status === "expired";
    return (
        <article
            data-testid="credit-balance"
            className={cx(
                "flex flex-col gap-4 rounded-xl bg-primary p-5 ring-1 ring-inset",
                status === "expired" ? "ring-error_subtle" : highlight ? "ring-2 ring-brand" : "ring-secondary",
            )}
        >
            <header className="flex items-start gap-3.5">
                <CoachAvatar coach={coach} className={cx(dim && "opacity-60")} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <h4 className="text-md font-semibold text-primary">{pack?.label ?? "Lesson credits"}</h4>
                    <p className="text-sm text-tertiary">with {coach.name}</p>
                </div>
                <StatusBadge tone={STATUS[status].tone}>{STATUS[status].label}</StatusBadge>
            </header>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-secondary px-4 py-3.5">
                <div className="flex flex-col gap-2">
                    <MicroLabel>Lessons remaining</MicroLabel>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-display-xs font-semibold text-primary tabular-nums">
                            {balance.creditsRemaining}
                            <span className="text-md font-medium text-tertiary">/{balance.creditsTotal}</span>
                        </span>
                        <CreditDots total={balance.creditsTotal} remaining={balance.creditsRemaining} muted={status === "expired"} />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <MicroLabel>{status === "expired" ? "Value unused" : "Value remaining"}</MicroLabel>
                    <span className={cx("text-lg font-semibold tabular-nums", status === "expired" ? "text-tertiary line-through" : "text-primary")}>{money(balance.valueRemaining)}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <MetaLine icon={Ticket02}>
                    {pack?.availability === "assigned" ? "Issued" : "Purchased"} {balance.purchasedOn}
                </MetaLine>
                <MetaLine icon={Calendar}>{balance.expiresOn ? `${status === "expired" ? "Expired" : "Expires"} ${balance.expiresOn}${pack?.expiration === CREDIT_TERM ? ` · ${CREDIT_TERM}` : ""}` : "No expiry"}</MetaLine>
                {pack && <MetaLine icon={Users01}>{pack.transferable ? "Transferable" : "Non-transferable"}</MetaLine>}
            </div>

            {balance.history.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-secondary pt-3.5">
                    <MicroLabel>Redemption history</MicroLabel>
                    <ul className="flex flex-col divide-y divide-secondary">
                        {balance.history.map((h, i) => (
                            <li key={`${h.date}-${i}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5 py-2 text-sm">
                                <span className="min-w-0 flex-1 text-secondary">{h.label}</span>
                                <span className="flex shrink-0 items-center gap-4">
                                    <span className="text-tertiary tabular-nums">{h.date}</span>
                                    <span className="font-semibold text-primary tabular-nums">−{money(h.valueRelieved)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {actions && <footer className="flex flex-wrap items-center gap-x-4 gap-y-2">{actions}</footer>}
        </article>
    );
};
