import { useState, type ReactNode } from "react";
import { ArrowRight, Building07, CheckCircle, Download01, Gift01, LifeBuoy01, Mail01, Phone, RefreshCcw01, Truck01, Wallet02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { WebPage } from "@/components/web/web-layout";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { USER, type Course } from "@/data/crane";
import { BUYER, GOOD_FOR, maskCode, money0, orderValue, toName } from "@/data/gift-cards";
import { useWebSession, WebShell } from "../web-shell";
import { ARRIVAL, computeGiftTotals, GIFT_ORDER_DATE, giftOrdersIn, itemsLabel, money, ORDER_DATE, paymentLabel, PICKUP } from "./checkout-data";
import { BrandChip, focusRing, GiftOrderLines, GiftTotalsBlock, OrderLines, TotalsBlock } from "./checkout-ui";
import { ConfettiBurst } from "./confetti";
import { giftCardIdAt, orderById, type PlacedOrder } from "./orders";

export interface ConfirmationPageProps {
    orderId: string;
}

const Section = ({ title, right, children, className }: { title: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) => (
    <section className={cx("border-t border-secondary px-5 py-7 @tablet:px-8", className)}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-primary">{title}</h2>
            {right}
        </div>
        <div className="mt-4">{children}</div>
    </section>
);

const Label = ({ children }: { children: ReactNode }) => <p className="caps text-quaternary">{children}</p>;

/** Where to find help: the course's desk (Pro Shop / Snack Bar) and TenFore support. */
const HelpSection = ({ course, place }: { course: Course; place: string }) => (
    <Section title="Where to find help">
        <div className="flex flex-col gap-5">
            <div className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                <div>
                    <p className="text-md font-semibold text-primary">Questions about your order</p>
                    <p className="mt-1 text-sm text-tertiary">
                        Contact the {course.name} {place} at{" "}
                        <a href={`tel:${course.phone ?? ""}`} className="font-medium text-brand-secondary hover:underline">
                            {course.phone}
                        </a>
                        {course.email && (
                            <>
                                {" "}
                                or{" "}
                                <a href={`mailto:${course.email}`} className="font-medium text-brand-secondary hover:underline">
                                    {course.email}
                                </a>
                            </>
                        )}
                        .
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                <LifeBuoy01 className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                <div>
                    <p className="text-md font-semibold text-primary">Help with this receipt or your account</p>
                    <p className="mt-1 text-sm text-tertiary">
                        Reach TenFore support 24/7 —{" "}
                        <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-brand-secondary hover:underline">
                            get support
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    </Section>
);

/**
 * Confirmation — Fox "Shop Checkout / 4. Confirmation - Purchase" as a Crane Web receipt:
 * order number, items, delivery or pickup, payment details with the destination tax line,
 * returns and help. Shipped and pickup (pro shop / snack bar) variants.
 */
export const ConfirmationPage = ({ orderId }: ConfirmationPageProps) => {
    const order = orderById(orderId);
    const { course } = useWebSession();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const ship = order.fulfillment === "ship";
    const food = order.kind === "food";
    const pickup = PICKUP[food ? "food" : "retail"];
    const t = order.totals;

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };

    if (order.kind === "gift-card") return <GiftConfirmation order={order} go={go} />;

    return (
        <WebShell active="shop">
            <WebPage width="content">
                <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset">
                    {/* Hero */}
                    <div className="flex flex-col items-center px-5 pt-9 pb-8 text-center @tablet:px-8">
                        <span className="flex size-14 items-center justify-center rounded-full bg-success-secondary ring-8 ring-bg-success-primary">
                            <CheckCircle className="size-7 text-fg-success-primary" aria-hidden="true" />
                        </span>
                        <p className="caps mt-6 text-brand-secondary">Order confirmed</p>
                        <p className="mt-1 text-md font-semibold text-tertiary tabular-nums">#{order.id}</p>
                        <h1 className="mt-3 text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">Thank you, {USER.firstName}!</h1>
                        <p className="mt-2 max-w-md text-md text-tertiary">
                            {ship
                                ? "Your Pro Shop order is confirmed. We'll email tracking when it ships."
                                : food
                                  ? "Your Snack Bar order is in. We'll text you when it's ready at the clubhouse window."
                                  : "Your Pro Shop order is confirmed. We'll text you when it's ready to pick up."}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary">
                            {ship ? <Truck01 className="size-4 text-fg-quaternary" aria-hidden="true" /> : <Building07 className="size-4 text-fg-quaternary" aria-hidden="true" />}
                            {ship ? `Estimated arrival ${ARRIVAL}` : `${pickup.ready} · ${course.shortName} ${pickup.place}`}
                        </p>
                    </div>

                    <Section
                        title={
                            <>
                                Items <span className="text-tertiary">({t.count})</span>
                            </>
                        }
                        right={<StatusBadge tone={order.plan === "installments" ? "warning" : "success"} className="text-sm">{order.plan === "installments" ? "Plan started" : "Paid"}</StatusBadge>}
                    >
                        <OrderLines lines={order.lines} />
                    </Section>

                    <Section title={ship ? "Delivery" : "Pickup"}>
                        <div className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                            {ship && order.address ? (
                                <div>
                                    <Label>Ship to</Label>
                                    <p className="mt-1.5 text-md font-medium text-primary">{order.address.name}</p>
                                    {order.address.company && <p className="text-sm text-tertiary">{order.address.company}</p>}
                                    <p className="text-sm text-tertiary">
                                        {order.address.street}
                                        {order.address.apt ? `, ${order.address.apt}` : ""}
                                    </p>
                                    <p className="text-sm text-tertiary">
                                        {order.address.city}, {order.address.state} {order.address.zip}, US
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <Label>Pick up at</Label>
                                    <p className="mt-1.5 text-md font-medium text-primary">
                                        {course.name} · {pickup.place}
                                    </p>
                                    <p className="text-sm text-tertiary">{course.address}</p>
                                    <p className="text-sm text-tertiary">{pickup.hours}</p>
                                </div>
                            )}
                            <div>
                                <Label>{ship ? "Method" : "When"}</Label>
                                <p className="mt-1.5 text-md font-medium text-primary">{ship ? "Ground Shipping" : pickup.ready}</p>
                                <p className="text-sm text-tertiary">{ship ? "4 to 7 business days" : `We'll text ${USER.phone}`}</p>
                                <p className="text-sm text-tertiary">{ship ? `Arrives ${ARRIVAL}` : "Bring your order number or show this page"}</p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Payment details">
                        <TotalsBlock totals={t} totalLabel={order.plan === "installments" ? "Order total" : "Total charged"} pickupLabel={ship ? undefined : `Pickup · ${pickup.place}`} />
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                            <span className="flex min-w-0 items-center gap-2.5 text-sm text-secondary">
                                <BrandChip brand={order.payment.brand} />
                                <span className="truncate">{paymentLabel(order.payment)}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                                {order.plan === "installments" ? `${money(t.total / 4)} today` : money(t.total)}
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-tertiary">
                            Paid online on {ORDER_DATE}
                            {order.promo ? ` · ${order.promo} applied` : ""} · {itemsLabel(t.count)}
                        </p>
                        <Button size="lg" color="outline" fullWidth iconLeading={Download01} className="mt-6 h-12 rounded-lg text-md">
                            Download PDF receipt
                        </Button>
                    </Section>

                    {!food && (
                        <Section title="Returns & exchanges">
                            <p className="text-md leading-relaxed text-tertiary">
                                Unworn items with tags can be returned within 30 days for a full refund. Custom-fit and personalized items are final sale. Bring your receipt to the Pro Shop or
                                start a return online.
                            </p>
                            <div className="mt-5 grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                {ship && (
                                    <Button size="lg" color="outline" iconLeading={Truck01} className="h-12 rounded-lg text-md">
                                        Track order
                                    </Button>
                                )}
                                <Button size="lg" color="outline" iconLeading={RefreshCcw01} className={cx("h-12 rounded-lg text-md", !ship && "@tablet:col-span-2")}>
                                    Start a return
                                </Button>
                            </div>
                        </Section>
                    )}

                    <HelpSection course={course} place={food ? "Snack Bar" : "Pro Shop"} />

                    <div className="border-t border-secondary px-5 py-6 @tablet:px-8">
                        <Button size="lg" fullWidth iconTrailing={ArrowRight} onPress={() => go("/shop")} className="caps h-14 rounded-lg text-[13px]">
                            Continue shopping
                        </Button>
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};

/* ---------- Gift card orders (Nov 25) ---------- */

/** The purchase email for an order: Self or Gift (see OrderEmailPage). */
export const orderEmailPath = (orderId: string) => `/order/${orderId}/email`;
/** The wallet with this order's card (or gift) marked new. */
export const walletBoughtPath = (orderId: string) => `/account/wallet?bought=${orderId}`;

/**
 * Confirmation for a gift card order: the shop receipt with Delivery as Send to / Method, the gift
 * totals, "View the email" (the purchase email at /order/<id>/email) and Gift card details in
 * place of Returns & exchanges. Confetti on arrival.
 */
const GiftConfirmation = ({ order, go }: { order: PlacedOrder; go: (path: string) => void }) => {
    const { course } = useWebSession();
    const [resent, setResent] = useState(false);
    const gifts = giftOrdersIn(order.lines);
    const totals = computeGiftTotals(order.lines);
    const first = gifts[0]?.order;
    if (!first) return null;

    const forMe = first.recipient === "me";
    const emailGift = !forMe && first.delivery === "email";
    const code = giftCardIdAt(0);
    const headline = forMe
        ? `Your ${money0(orderValue(first))} gift card is in your wallet.`
        : emailGift
          ? `${toName(first)} gets the card by email today.`
          : `We've emailed the printable card to ${BUYER.email}.`;
    const pill = forMe ? "Saved to your wallet" : emailGift ? `Emailed to ${toName(first)} today` : "Emailed to you to print";
    const PillIcon = forMe ? Wallet02 : Mail01;

    return (
        <WebShell active="shop">
            <WebPage width="content" className="relative">
                <ConfettiBurst />
                <div className="mx-auto max-w-[720px] overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset">
                    {/* Hero */}
                    <div className="flex flex-col items-center px-5 pt-9 pb-8 text-center @tablet:px-8">
                        <span className="flex size-14 items-center justify-center rounded-full bg-success-secondary ring-8 ring-bg-success-primary">
                            <CheckCircle className="size-7 text-fg-success-primary" aria-hidden="true" />
                        </span>
                        <p className="caps mt-6 text-brand-secondary">Order confirmation</p>
                        <p className="mt-1 text-md font-semibold text-tertiary tabular-nums">#{order.id}</p>
                        <h1 className="mt-3 text-display-xs font-bold tracking-[-0.3px] text-primary @tablet:text-display-sm">Thank you, {USER.firstName}!</h1>
                        <p className="mt-2 max-w-md text-md text-tertiary">
                            Your gift card order is confirmed. {headline}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary">
                            <PillIcon className="size-4 text-fg-quaternary" aria-hidden="true" />
                            {pill}
                        </p>
                    </div>

                    <Section
                        title={
                            <>
                                Items <span className="text-tertiary">({totals.count})</span>
                            </>
                        }
                        right={<StatusBadge className="text-sm">Paid</StatusBadge>}
                    >
                        <GiftOrderLines lines={order.lines} />
                    </Section>

                    <Section title="Delivery">
                        <div className="flex flex-col gap-6">
                            {gifts.map(({ lineId, order: o }) => {
                                const me = o.recipient === "me";
                                return (
                                    <div key={lineId} className="grid grid-cols-1 gap-5 @tablet:grid-cols-2">
                                        <div>
                                            <Label>{me ? "For" : "Send to"}</Label>
                                            <p className="mt-1.5 text-md font-medium text-primary">{me ? `${BUYER.name} (you)` : toName(o)}</p>
                                            <p className="text-sm text-tertiary">{me ? "Your wallet" : o.delivery === "email" ? o.toEmail.trim() : `Printable copy to ${BUYER.email}`}</p>
                                            {!me && o.delivery === "email" && o.toPhone.trim() && <p className="text-sm text-tertiary">Text to {o.toPhone.trim()}</p>}
                                            {!me && <p className="text-sm text-tertiary">From {o.fromName.trim() || BUYER.name}</p>}
                                        </div>
                                        <div>
                                            <Label>Method</Label>
                                            <p className="mt-1.5 text-md font-medium text-primary">{me ? "Wallet" : "Email"}</p>
                                            <p className="text-sm text-tertiary">Today</p>
                                            {!me && o.message.trim() && <p className="text-sm text-tertiary">“{o.message.trim()}”</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>

                    <Section title="Payment details">
                        <GiftTotalsBlock totals={totals} totalLabel="Total charged" />
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                            <span className="flex min-w-0 items-center gap-2.5 text-sm text-secondary">
                                <BrandChip brand={order.payment.brand} />
                                <span className="truncate">{paymentLabel(order.payment)}</span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">{money(totals.total)}</span>
                        </div>
                        <p className="mt-3 text-sm text-tertiary">
                            Paid online on {GIFT_ORDER_DATE}. We emailed your receipt to {BUYER.email}.{" "}
                            <WebLink href={orderEmailPath(order.id)} className={cx("rounded font-semibold text-brand-secondary hover:underline", focusRing)}>
                                View the email
                            </WebLink>
                        </p>
                        <Button size="lg" color="outline" fullWidth iconLeading={Download01} className="mt-6 h-12 rounded-lg text-md">
                            Download PDF receipt
                        </Button>
                    </Section>

                    <Section title="Gift card details">
                        <p className="text-md leading-relaxed text-tertiary">
                            Card code <span className="font-mono font-medium text-primary tabular-nums">{forMe ? code : maskCode(code)}</span>. Good for {GOOD_FOR} at {course.name}. It doesn't
                            expire, and gift cards can't be returned or exchanged for cash.
                        </p>
                        <div className="mt-5 grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                            <Button size="lg" color="outline" iconLeading={Wallet02} onPress={() => go(walletBoughtPath(order.id))} className="h-12 rounded-lg text-md">
                                {forMe ? "See it in your wallet" : "See your gift cards"}
                            </Button>
                            {emailGift && (
                                <Button size="lg" color="outline" iconLeading={resent ? CheckCircle : Mail01} isDisabled={resent} onPress={() => setResent(true)} className="h-12 rounded-lg text-md">
                                    {resent ? `Sent again to ${first.toFirstName.trim()}` : "Resend the email"}
                                </Button>
                            )}
                            <Button size="lg" color="outline" iconLeading={Gift01} onPress={() => go("/shop/gift-cards")} className={cx("h-12 rounded-lg text-md", emailGift && "@tablet:col-span-2")}>
                                Buy another gift card
                            </Button>
                        </div>
                    </Section>

                    <HelpSection course={course} place="Pro Shop" />

                    <div className="border-t border-secondary px-5 py-6 @tablet:px-8">
                        <Button size="lg" fullWidth iconTrailing={ArrowRight} onPress={() => go("/shop")} className="caps h-14 rounded-lg text-[13px]">
                            Continue shopping
                        </Button>
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};
