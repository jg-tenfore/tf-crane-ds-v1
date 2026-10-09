import { useState } from "react";
import { Calendar, ChevronRight, CreditCard02, Receipt } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { Screen, useNavChromeHeight } from "@/components/device/screen";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { UnderlineTabs } from "@/components/navigation/underline-tabs";
import { EmptyState } from "@/components/feedback/empty-state";
import { IconTile } from "@/components/base/card";
import { useStack } from "@/components/prototype/stack-navigator";
import { PURCHASES, currency, type Booking } from "@/data/crane";
import { useBookings } from "./bookings-store";

const rowClass =
    "press-scale flex w-full cursor-pointer items-center gap-3 rounded-ios-card bg-primary p-3 text-left shadow-ios-card ring-1 ring-secondary/60 outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

const DateTile = ({ date }: { date: Date }) => (
    <span className="flex w-[52px] shrink-0 flex-col items-center rounded-lg bg-secondary py-1.5">
        <span className="text-[10px] font-semibold tracking-[0.08em] text-tertiary uppercase">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <span className="text-ios-title2 leading-[26px] text-primary">{date.getDate()}</span>
        <span className="text-[10px] font-semibold tracking-[0.08em] text-tertiary uppercase">{date.toLocaleDateString("en-US", { month: "short" })}</span>
    </span>
);

const BookingRow = ({ booking, onPress }: { booking: Booking; onPress: () => void }) => (
    <AriaButton onPress={onPress} className={rowClass}>
        <DateTile date={booking.date} />
        <span className="min-w-0 flex-1">
            <span className="block truncate text-ios-headline text-primary">{booking.course.name}</span>
            <span className="block truncate text-ios-subheadline text-tertiary">
                {booking.time} · {booking.players} {booking.players === 1 ? "player" : "players"} · {booking.course.shortName}
            </span>
        </span>
        <ChevronRight className="size-5 text-fg-quaternary" aria-hidden="true" />
    </AriaButton>
);

/** Bookings tab — Reservations (upcoming / past tee times) and Purchases (orders). */
export const BookingsScreen = ({ initialTab = "reservations", empty }: { initialTab?: "reservations" | "purchases"; empty?: boolean }) => {
    const stack = useStack();
    const [tab, setTab] = useState(initialTab);
    const navHeight = useNavChromeHeight();
    const store = useBookings();
    const bookings = empty ? [] : store.bookings;
    const upcoming = bookings.filter((b) => b.status === "upcoming");
    const past = bookings.filter((b) => b.status === "past");

    return (
        <Screen
            topInset={navHeight + 45}
            nav={
                <div>
                    <NavigationBar title="Bookings" divider={false} />
                    <UnderlineTabs
                        aria-label="Bookings"
                        tabs={[
                            { id: "reservations", label: "Reservations" },
                            { id: "purchases", label: "Purchases" },
                        ]}
                        selectedId={tab}
                        onChange={(id) => setTab(id as typeof tab)}
                    />
                </div>
            }
        >
            {tab === "reservations" ? (
                bookings.length === 0 ? (
                    <EmptyState variant="featured" icon={Calendar} title="No reservations yet" description="Tee times you book will show up here." className="pt-40" />
                ) : (
                    <div className="space-y-5 px-gutter pt-4">
                        {[
                            ["Upcoming", upcoming],
                            ["Past", past],
                        ].map(([label, list]) =>
                            (list as Booking[]).length ? (
                                <section key={label as string}>
                                    <h2 className="mb-2.5 text-ios-title3 font-bold text-primary">{label as string}</h2>
                                    <div className="space-y-2.5">
                                        {(list as Booking[]).map((b) => (
                                            <BookingRow key={b.id} booking={b} onPress={() => stack.push("tee-time-details", { id: b.id })} />
                                        ))}
                                    </div>
                                </section>
                            ) : null,
                        )}
                    </div>
                )
            ) : (
                <div className="space-y-2.5 px-gutter pt-4">
                    {PURCHASES.map((p) => (
                        <AriaButton key={p.id} onPress={() => stack.push("purchase-details", { id: p.id })} className={`${rowClass} flex-col items-stretch gap-0 p-4`}>
                            <span className="flex items-center gap-3">
                                <IconTile icon={Receipt} shape="circle" tone="gray" />
                                <span className="flex-1">
                                    <span className="block text-ios-headline text-primary">
                                        {p.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                    <span className="block text-ios-footnote text-tertiary">{p.time}</span>
                                </span>
                                <span className="text-ios-title3 font-bold text-brand-secondary tabular-nums">{currency(p.total)}</span>
                            </span>
                            <span className="mt-3 block text-ios-footnote text-tertiary">{p.items.length} items</span>
                            <ul className="mt-1 space-y-0.5 text-ios-body text-primary">
                                {p.items.slice(0, 2).map((it, i) => (
                                    <li key={i}>• {it.name}</li>
                                ))}
                            </ul>
                            {p.items.length > 2 && <span className="mt-0.5 block text-ios-footnote text-tertiary italic">+{p.items.length - 2} more</span>}
                            <span className="mt-3 flex items-center gap-1.5 border-t border-secondary pt-3 text-ios-footnote text-tertiary">
                                <CreditCard02 className="size-4" aria-hidden="true" />
                                {p.card.brand} •••• {p.card.last4}
                            </span>
                        </AriaButton>
                    ))}
                </div>
            )}
        </Screen>
    );
};
