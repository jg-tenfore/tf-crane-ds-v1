import { useState } from "react";
import { useToast } from "@/components/feedback/toast";
import { Calendar, CheckCircle, CreditCard02, Flag01, User01, Users01 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { Card, IconTile, Section } from "@/components/base/card";
import { Tag } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Notice, StatusBanner } from "@/components/feedback/notice";
import { AlertDialog } from "@/components/feedback/alert-dialog";
import { KeyValueRow } from "@/components/lists/list";
import { useStack } from "@/components/prototype/stack-navigator";
import { PURCHASES, USER, currency } from "@/data/crane";
import { useBookings } from "./bookings-store";

/** Tee Time Details — date, course, players with their rates, total, and cancel rules. */
export const TeeTimeDetailsScreen = ({ id = "b-2" }: { id?: string }) => {
    const stack = useStack();
    const { bookings, cancelBooking } = useBookings();
    const toast = useToast();
    // Snapshot on mount so the screen doesn't change under the pop animation after a cancel.
    const [b] = useState(() => bookings.find((x) => x.id === id) ?? bookings[0]);
    const past = b.status === "past";
    const rate = past ? 34 : 53;
    const [confirm, setConfirm] = useState(false);
    const players = [
        { name: `${USER.firstName} ${USER.lastName}`, role: "Booker" as const },
        ...Array.from({ length: b.players - 1 }, () => ({ name: `${USER.firstName} ${USER.lastName}`, role: "Guest" as const })),
    ];

    return (
        <Screen nav={<NavigationBar backLabel="Bookings" onBack={stack.pop} title="Tee Time Details" titleTone="brand" />}>
            {past && <StatusBanner tone="error">This booking has expired</StatusBanner>}
            <div className="space-y-6 pt-4">
                <Section title="Date & Time" icon={Calendar}>
                    <Card>
                        <div className="text-ios-headline text-primary">{b.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                        <div className="text-ios-title2 text-brand-secondary">{b.time}</div>
                    </Card>
                </Section>
                <Section title="Course Details" icon={Flag01}>
                    <Card className="py-1">
                        <KeyValueRow label="Course" value={b.course.shortName} />
                        <KeyValueRow label="Golf Course" value={b.course.name} />
                        <KeyValueRow label="Number of Holes" value={b.holes} />
                        <KeyValueRow label="Players" value={b.players} />
                    </Card>
                </Section>
                <Section title={`Players (${b.players})`} icon={Users01}>
                    <div className="space-y-2.5">
                        {players.map((p, i) => (
                            <Card key={i} padding="none">
                                <div className="px-4 pt-3 pb-2">
                                    <div className="flex items-center gap-2">
                                        <User01 className={i === 0 ? "size-5 text-fg-brand-primary" : "size-5 text-fg-quaternary"} aria-hidden="true" />
                                        <span className={i === 0 ? "text-ios-headline text-brand-secondary" : "text-ios-headline text-primary"}>{p.name}</span>
                                        <Tag tone={p.role === "Booker" ? "brand" : "gray"}>{p.role}</Tag>
                                    </div>
                                    <div className="pl-7 text-ios-subheadline text-tertiary">{USER.email}</div>
                                </div>
                                <div className="border-t border-secondary px-4 py-1">
                                    <KeyValueRow label="Weekday Non Resident" value={currency(rate)} />
                                    <div className="pb-2 text-ios-footnote text-tertiary">Walking</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Section>
                <div className="px-gutter">
                    <Card className="py-2">
                        <KeyValueRow label="Total" value={currency(rate * b.players)} tone="brand" />
                    </Card>
                </div>
                <div className="px-gutter">
                    {past ? (
                        <Notice variant="accent" tone="error">
                            This tee time is in the past and cannot be cancelled.
                        </Notice>
                    ) : (
                        <Button color="outline" size="lg" fullWidth className="text-error-primary" onPress={() => setConfirm(true)}>
                            Cancel Tee Time
                        </Button>
                    )}
                </div>
            </div>
            <AlertDialog
                isOpen={confirm}
                onOpenChange={setConfirm}
                title="Cancel tee time?"
                message={`${b.time} at ${b.course.name}. Cancellations inside 24 hours may incur a no-show fee.`}
                actions={[
                    { label: "Keep", style: "cancel" },
                    {
                        label: "Cancel Tee Time",
                        style: "destructive",
                        onPress: () => {
                            cancelBooking(b.id);
                            toast.show({ title: "Tee time cancelled" });
                            stack.pop();
                        },
                    },
                ]}
            />
        </Screen>
    );
};

/** Purchase Details — order receipt with items, summary and payment method. */
export const PurchaseDetailsScreen = ({ id = "p-1" }: { id?: string }) => {
    const stack = useStack();
    const p = PURCHASES.find((x) => x.id === id) ?? PURCHASES[0];
    return (
        <Screen nav={<NavigationBar backLabel="Bookings" onBack={stack.pop} title="Purchase Details" titleTone="brand" />}>
            <div className="flex flex-col items-center border-b border-secondary bg-primary px-gutter pt-6 pb-5 text-center">
                <CheckCircle className="size-11 fill-fg-brand-primary text-white" aria-hidden="true" />
                <h2 className="mt-2 text-ios-title2 text-primary">Order Complete</h2>
                <div className="text-ios-headline font-medium text-tertiary">Order #{p.orderNumber}</div>
                <div className="mt-0.5 text-ios-body text-tertiary">{p.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
                <div className="text-ios-footnote text-quaternary">{p.time}</div>
            </div>
            <div className="space-y-6 pt-5">
                <Section title="Items">
                    <Card padding="none" className="divide-y divide-border-secondary">
                        {p.items.map((it, i) => (
                            <div key={i} className="flex justify-between gap-3 px-4 py-3">
                                <div>
                                    <div className="text-ios-headline text-primary">{it.name}</div>
                                    <div className="text-ios-subheadline text-tertiary">{it.detail}</div>
                                    <div className="text-ios-footnote text-quaternary">Qty: {it.qty}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-ios-headline text-primary tabular-nums">{currency(it.price * it.qty)}</div>
                                    {it.price > 0 && <div className="text-ios-footnote text-quaternary">{currency(it.price)} each</div>}
                                </div>
                            </div>
                        ))}
                    </Card>
                </Section>
                <Section title="Order Summary">
                    <Card className="py-1">
                        <KeyValueRow label="Subtotal" value={currency(p.total)} />
                        <div className="border-t border-secondary" />
                        <KeyValueRow label="Total" value={currency(p.total)} tone="brand" />
                    </Card>
                </Section>
                <Section title="Payment Method">
                    <Card className="flex items-center gap-3">
                        <IconTile icon={CreditCard02} shape="circle" />
                        <div className="flex-1">
                            <div className="text-ios-headline text-primary">
                                {p.card.brand} •••• {p.card.last4}
                            </div>
                            <div className="text-ios-footnote text-tertiary">Complete</div>
                        </div>
                        <div className="text-ios-headline text-primary tabular-nums">{currency(p.total)}</div>
                    </Card>
                </Section>
            </div>
        </Screen>
    );
};
