import type { ReactNode } from "react";
import { CalendarCheck01, ChevronRight, Flag06, Receipt, ShoppingBag01, Ticket02 } from "@untitledui/icons";
import { IconTile } from "@/components/base/card";
import { CapsTabs } from "@/components/web/web-layout";
import { WebDialog } from "@/components/web/web-dialog";
import { matchPath, useWebRouter, WebLink } from "@/components/web/web-router";
import { BOOKINGS, currency, formatDate } from "@/data/crane";
import { ACCOUNT_PURCHASES, EVENT_KIND_LABEL, PAST_EVENTS } from "./account-data";
import { AccountLayout } from "./account-layout";
import { upcomingItems } from "./account-overview-screen";
import { AccountTitle, EmptyBlock, LinkButton, Pill, WebButton, shortDay } from "./account-ui";

export type ActivityTab = "upcoming" | "past" | "purchases";

const rowLink =
    "flex items-center gap-4 px-5 py-4 outline-none transition duration-100 ease-linear hover:bg-primary_hover focus-visible:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60 focus-visible:ring-inset";

const ActivityRow = ({
    href,
    icon,
    tone,
    title,
    detail,
    trailing,
    trailingOnMobile,
}: {
    href: string;
    icon: typeof Flag06;
    tone?: "brand" | "gray";
    title: string;
    detail: string;
    trailing: ReactNode;
    /** Keep the trailing value at 390 (purchase totals); status pills hide there. */
    trailingOnMobile?: boolean;
}) => (
    <li>
        <WebLink href={href} className={rowLink}>
            <IconTile icon={icon} tone={tone} />
            <span className="min-w-0 flex-1">
                <span className="block text-md font-semibold text-primary @tablet:truncate">{title}</span>
                <span className="block text-sm text-tertiary @tablet:truncate">{detail}</span>
            </span>
            <span className={trailingOnMobile ? "shrink-0" : "hidden shrink-0 @tablet:block"}>{trailing}</span>
            <ChevronRight className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
        </WebLink>
    </li>
);

const pastItems = () =>
    [
        ...BOOKINGS.filter((b) => b.status === "past").map((b) => ({
            id: b.id,
            date: b.date,
            icon: Flag06,
            title: `Tee Time · ${b.course.name}`,
            detail: `${shortDay(b.date)}, ${b.date.getFullYear()} · ${b.time} · ${b.players} players · ${b.holes} holes`,
            href: `/tee-times/bookings/${b.id}`,
        })),
        ...PAST_EVENTS.map((e) => ({
            id: e.id,
            date: e.date,
            icon: Ticket02,
            title: `${EVENT_KIND_LABEL[e.kind]} · ${e.title}`,
            detail: `${shortDay(e.date)}, ${e.date.getFullYear()} · ${e.location}`,
            href: `/account/events?open=${e.id}`,
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

const ReceiptDialog = ({ orderNumber, onClose }: { orderNumber: string | null; onClose: () => void }) => {
    const p = ACCOUNT_PURCHASES.find((x) => x.orderNumber === orderNumber);
    return (
        <WebDialog
            isOpen={!!p}
            onOpenChange={(o) => !o && onClose()}
            title={p ? `Order #${p.orderNumber}` : ""}
            description={p ? `${p.source} · ${formatDate(p.date)} at ${p.time}` : undefined}
            footer={
                <WebButton color="outline" onPress={onClose}>
                    Done
                </WebButton>
            }
        >
            {p && (
                <div className="flex flex-col">
                    <ul className="divide-y divide-secondary">
                        {p.items.map((i, n) => (
                            <li key={n} className="flex items-start justify-between gap-4 py-3">
                                <div className="min-w-0">
                                    <p className="text-md font-medium text-primary">{i.name}</p>
                                    <p className="text-sm text-tertiary">
                                        {i.detail} · Qty {i.qty}
                                    </p>
                                </div>
                                <span className="text-md text-primary tabular-nums">{currency(i.price * i.qty)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between border-t border-secondary pt-4">
                        <span className="text-md font-semibold text-primary">Total</span>
                        <span className="text-lg font-semibold text-primary tabular-nums">{currency(p.total)}</span>
                    </div>
                    <p className="mt-1 text-sm text-tertiary">
                        Paid with {p.card.brand} •••• {p.card.last4}
                    </p>
                </div>
            )}
        </WebDialog>
    );
};

/**
 * Activity — ports Fox "Profile ∕ Account/Activity": reservations (upcoming / past) and
 * purchases as tabs. Tabs and receipts are deep links: /account/activity?tab=past,
 * /account/activity/orders/4243305.
 */
export const AccountActivityScreen = () => {
    const { path, navigate } = useWebRouter();
    const query = new URLSearchParams(path.split("?")[1] ?? "");
    const order = matchPath("/account/activity/orders/:order", path)?.order ?? null;
    const tab: ActivityTab = order ? "purchases" : ((query.get("tab") as ActivityTab) ?? "upcoming");

    const upcoming = upcomingItems();
    const past = pastItems();

    return (
        <AccountLayout active="activity">
            <div className="flex flex-col gap-6">
                <AccountTitle title="Activity" subtitle="Your reservations and everything you've bought, at every course." />

                <section aria-label="Activity" className="overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                    <CapsTabs
                        label="Activity"
                        className="border-b border-secondary px-5 pt-4"
                        tabs={[
                            { href: "/account/activity", label: `Upcoming · ${upcoming.length}`, active: tab === "upcoming" },
                            { href: "/account/activity?tab=past", label: `Past · ${past.length}`, active: tab === "past" },
                            { href: "/account/activity?tab=purchases", label: `Purchases · ${ACCOUNT_PURCHASES.length}`, active: tab === "purchases" },
                        ]}
                    />

                    {tab === "upcoming" &&
                        (upcoming.length ? (
                            <ul className="divide-y divide-secondary">
                                {upcoming.map((u) => (
                                    <ActivityRow
                                        key={u.id}
                                        href={u.href}
                                        icon={u.kind === "tee-time" ? Flag06 : Ticket02}
                                        tone={u.kind === "tee-time" ? "brand" : "gray"}
                                        title={u.title}
                                        detail={u.detail}
                                        trailing={<Pill tone="success">{u.kind === "tee-time" ? "Booked" : "Registered"}</Pill>}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <EmptyBlock icon={CalendarCheck01} title="Nothing coming up" description="Book a tee time or sign up for an event." action={<LinkButton href="/tee-times">Book a tee time</LinkButton>} />
                        ))}

                    {tab === "past" && (
                        <ul className="divide-y divide-secondary">
                            {past.map((p) => (
                                <ActivityRow key={p.id} href={p.href} icon={p.icon} tone="gray" title={p.title} detail={p.detail} trailing={<Pill tone="gray">Completed</Pill>} />
                            ))}
                        </ul>
                    )}

                    {tab === "purchases" && (
                        <ul className="divide-y divide-secondary">
                            {ACCOUNT_PURCHASES.map((p) => {
                                const count = p.items.reduce((n, i) => n + i.qty, 0);
                                return (
                                    <ActivityRow
                                        key={p.id}
                                        href={`/account/activity/orders/${p.orderNumber}`}
                                        icon={p.source === "Tee time" ? Receipt : ShoppingBag01}
                                        tone="gray"
                                        title={`Order #${p.orderNumber} · ${p.source}`}
                                        detail={`${formatDate(p.date)} · ${count} item${count === 1 ? "" : "s"} · ${p.card.brand} •••• ${p.card.last4}`}
                                        trailingOnMobile
                                        trailing={<span className="text-md font-semibold text-primary tabular-nums">{currency(p.total)}</span>}
                                    />
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            <ReceiptDialog orderNumber={order} onClose={() => navigate("/account/activity?tab=purchases")} />
        </AccountLayout>
    );
};
