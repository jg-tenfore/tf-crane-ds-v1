import { useState, type ReactNode } from "react";
import { ArrowLeft, Building07, ChevronDown, ChevronUp, Clock, Edit03, Gift01, Lock01, MarkerPin01, Plus, ShoppingBag01, Truck01, User01, Wallet02 } from "@untitledui/icons";
import { Button as AriaButton, Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tag } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { BUYER, giftCardsHref, toName, type GiftCardOrder } from "@/data/gift-cards";
import { GROUND_SHIPPING } from "@/data/shop";
import { LinkButton } from "../account/account-ui";
import { useCart } from "../cart-store";
import { useWebSession, WebShell } from "../web-shell";
import { AddressDialog } from "./address-dialog";
import {
    addressLine,
    computeGiftTotals,
    computeTotals,
    giftOrdersIn,
    money,
    PICKUP,
    REWARDS,
    SAVED_ADDRESSES,
    SAVED_PAYMENTS,
    type Address,
    type Fulfillment,
    type Plan,
    type SavedPayment,
} from "./checkout-data";
import { BrandChip, ChoiceRow, focusRing, GiftOrderLines, GiftTotalsBlock, OrderLines, PanelSection, PromoField, RadioDot, TotalsBlock } from "./checkout-ui";
import { takeCarriedPromo } from "./checkout-session";
import { placeOrder } from "./orders";
import { PaymentDialog } from "./payment-dialog";

export interface CheckoutPageProps {
    /** Ship or pick up. Food carts are always pickup. */
    fulfillment?: Fulfillment;
    /** Selected ship-to address id ("addr-ma" | "addr-ga"); `null` = no address yet. Defaults to the default address. */
    addressId?: string | null;
    /** Open the Ship to list so both saved addresses are visible. */
    shipToOpen?: boolean;
    plan?: Plan;
    /** Promo / gift card already applied. */
    promo?: string;
    rewardApplied?: boolean;
    addressModalOpen?: boolean;
    /** Pre-typed query in the Add address modal (shows the type-ahead). */
    addressQuery?: string;
    paymentModalOpen?: boolean;
    /** Mobile web: start with the order summary expanded. */
    summaryOpen?: boolean;
    /** Gift card orders: start with the Send to details (message, phone, from) open. */
    sendToOpen?: boolean;
}

/* ---------- Payment (saved cards, shared by shop and gift card checkout) ---------- */

const PaymentSection = ({
    payments,
    setPayments,
    paymentId,
    setPaymentId,
    onAdd,
}: {
    payments: SavedPayment[];
    setPayments: (update: (ps: SavedPayment[]) => SavedPayment[]) => void;
    paymentId: string;
    setPaymentId: (id: string) => void;
    onAdd: () => void;
}) => (
    <PanelSection label="Payment" right={<span className="flex items-center gap-1 text-xs text-tertiary"><Lock01 className="size-3.5" aria-hidden="true" /> Encrypted</span>}>
        <AriaRadioGroup aria-label="Payment method" value={paymentId} onChange={setPaymentId} className="flex flex-col gap-2">
            {payments.map((p) => (
                <div key={p.id}>
                    <ChoiceRow value={p.id} isDisabled={!!p.expired} muted={!!p.expired} className="data-[disabled]:opacity-60">
                        <span className="flex flex-wrap items-center gap-2">
                            <span className="text-md font-semibold text-primary">
                                {p.name}
                                {p.last4 && ` ···· ${p.last4}`}
                            </span>
                            <BrandChip brand={p.brand} />
                            {p.expired && (
                                <Tag tone="error" variant="soft">
                                    Exp. {p.expired}
                                </Tag>
                            )}
                        </span>
                        <span className="block truncate text-sm text-tertiary">{p.brand === "PayPal" ? "You'll finish on PayPal" : `${USER.firstName} ${USER.lastName}, ${addressLine(SAVED_ADDRESSES[0])}`}</span>
                    </ChoiceRow>
                    {p.expired && (
                        <div className="mt-1 ml-12 flex items-center gap-3 text-sm">
                            <span className="text-tertiary">This card has expired.</span>
                            <Button size="sm" color="plain-destructive" onPress={() => setPayments((ps) => ps.filter((x) => x.id !== p.id))} className="h-7 text-sm">
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </AriaRadioGroup>
        <Button size="md" color="plain" iconLeading={Plus} onPress={onAdd} className="h-10 self-start text-sm">
            Pay another way
        </Button>
    </PanelSection>
);

/* ---------- Order summary (right column / mobile disclosure) ---------- */

const Summary = ({
    lines,
    totals,
    promo,
    setPromo,
    rewardApplied,
    setRewardApplied,
    unknownZip,
    pickupLabel,
}: {
    lines: ReturnType<typeof useCart>["lines"];
    totals: ReturnType<typeof computeTotals>;
    promo: string | null;
    setPromo: (p: string | null) => void;
    rewardApplied: boolean;
    setRewardApplied: (v: boolean) => void;
    unknownZip: ReactNode;
    pickupLabel?: string;
}) => (
    <div className="flex flex-col">
        <div className="px-5 py-5">
            <OrderLines lines={lines} />
        </div>

        {/* Rewards (Fox) */}
        <div className="border-t border-secondary px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-md font-semibold text-primary">You have {REWARDS.points - (rewardApplied ? REWARDS.cost : 0)} points</p>
                <span className="caps text-quaternary">Rewards</span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-warning-primary">
                <Clock className="size-4 shrink-0" aria-hidden="true" /> Hurry! {REWARDS.expiringPoints} points expire in {REWARDS.expiringInDays} days.
            </p>
            <div className="mt-3 flex items-center gap-2">
                <div className="flex h-11 min-w-0 flex-1 flex-col justify-center rounded-lg px-3 ring-1 ring-primary ring-inset">
                    <span className="text-xs text-tertiary">Reward</span>
                    <span className="truncate text-sm font-medium text-primary">
                        ${REWARDS.value} off for {REWARDS.cost} points
                    </span>
                </div>
                {rewardApplied ? (
                    <Button size="md" color="outline" onPress={() => setRewardApplied(false)} className="h-11 rounded-lg text-md">
                        Remove
                    </Button>
                ) : (
                    <Button size="md" color="outline-brand" onPress={() => setRewardApplied(true)} className="h-11 rounded-lg text-md">
                        Apply
                    </Button>
                )}
            </div>
        </div>

        <div className="border-t border-secondary px-5 py-4">
            <PromoField label="Discount code or gift card" applied={promo} onApply={setPromo} onRemove={() => setPromo(null)} />
        </div>

        <div className="border-t border-secondary px-5 py-5">
            <TotalsBlock totals={totals} pickupLabel={pickupLabel} />
            {unknownZip}
        </div>
    </div>
);

/**
 * Checkout — Fox "Shop Checkout / 3. Checkout" rebuilt for Crane Web, plus the Nov 11 rules:
 * Ship vs Pick up at the course, destination tax (state + county + city) that recalculates
 * with the ship-to address, food orders pickup-only, fees + surcharge.
 */
export const CheckoutPage = ({
    fulfillment: initialFulfillment,
    addressId: initialAddressId,
    shipToOpen = false,
    plan: initialPlan = "now",
    promo: initialPromo,
    rewardApplied: initialReward = false,
    addressModalOpen = false,
    addressQuery,
    paymentModalOpen = false,
    summaryOpen: initialSummaryOpen = false,
    sendToOpen = false,
}: CheckoutPageProps) => {
    const cart = useCart();
    const { course } = useWebSession();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();

    const kinds = new Set(cart.lines.map((l) => l.product.kind));
    const mixed = kinds.size > 1;
    const food = !mixed && cart.kind === "food";

    const [fulfillmentChoice, setFulfillment] = useState<Fulfillment>(initialFulfillment ?? (food ? "pickup" : "ship"));
    const fulfillment: Fulfillment = food ? "pickup" : fulfillmentChoice;
    const [addresses, setAddresses] = useState<Address[]>(SAVED_ADDRESSES);
    const [addressId, setAddressId] = useState<string | null>(initialAddressId === undefined ? (SAVED_ADDRESSES.find((a) => a.isDefault)?.id ?? null) : initialAddressId);
    const [shipOpen, setShipOpen] = useState(shipToOpen || initialAddressId === null);
    const [plan, setPlan] = useState<Plan>(initialPlan);
    const [payments, setPayments] = useState<SavedPayment[]>(SAVED_PAYMENTS);
    const [paymentId, setPaymentId] = useState(SAVED_PAYMENTS[0].id);
    const [promo, setPromo] = useState<string | null>(() => initialPromo ?? takeCarriedPromo());
    const [rewardApplied, setRewardApplied] = useState(initialReward);
    const [addrOpen, setAddrOpen] = useState(addressModalOpen);
    const [payOpen, setPayOpen] = useState(paymentModalOpen);
    const [summaryOpen, setSummaryOpen] = useState(initialSummaryOpen);
    const [placing, setPlacing] = useState(false);

    const address = addresses.find((a) => a.id === addressId) ?? null;
    const totals = computeTotals({ lines: cart.lines, fulfillment, address: fulfillment === "ship" ? address : null, promo, rewardApplied });
    const payment = payments.find((p) => p.id === paymentId) ?? payments[0];
    const needsAddress = fulfillment === "ship" && !address;
    const pickup = PICKUP[food ? "food" : "retail"];
    const installments = !food && plan === "installments";

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };

    const pay = () => {
        if (needsAddress || !payment) return;
        setPlacing(true);
        window.setTimeout(() => {
            const id = placeOrder({ lines: cart.lines, kind: food ? "food" : "retail", fulfillment, address: fulfillment === "ship" ? address : null, payment, plan: installments ? "installments" : "now", totals, promo });
            cart.clear();
            go(`/order/${id}`);
        }, 700);
    };

    const back = (
        <WebLink href="/cart" className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
        </WebLink>
    );

    /* Guard rails: nothing to check out, or a mixed cart that slipped through. */
    if (cart.lines.length === 0 || mixed) {
        return (
            <WebShell active="shop" footer={false}>
                <WebPage width="content">
                    <PageHeader back={back} eyebrow="Secure checkout" title="Checkout" />
                    <Panel className="mt-8" bodyClassName="flex flex-col items-center px-6 py-14 text-center">
                        <ShoppingBag01 className="size-10 text-fg-quaternary" aria-hidden="true" />
                        <h2 className="mt-4 text-xl font-semibold text-primary">{mixed ? "Food & drinks check out separately" : "There's nothing to check out"}</h2>
                        <p className="mt-1.5 max-w-md text-md text-tertiary">
                            {mixed ? "Your cart has pro shop items and snack-bar items. Go back to the cart and remove one group first." : "Your cart is empty. Add something from the shop first."}
                        </p>
                        <Button size="lg" className="mt-6 rounded-lg text-md" onPress={() => go(mixed ? "/cart" : "/shop")}>
                            {mixed ? "Back to cart" : "Shop the Pro Shop"}
                        </Button>
                    </Panel>
                </WebPage>
            </WebShell>
        );
    }

    // Gift cards check out on their own: Send to and Delivery instead of an address, shipping and tax.
    if (cart.kind === "gift-card") return <GiftCheckout sendToOpen={sendToOpen} summaryOpen={initialSummaryOpen} paymentModalOpen={paymentModalOpen} />;

    const unknownZip =
        fulfillment === "ship" && totals.taxQuote?.estimated && address ? (
            <Notice tone="warning" title="We'll confirm tax for this address" className="mt-4 rounded-lg text-sm">
                ZIP {address.zip} isn't in our tax table yet, so tax is estimated at the {address.state} rate. The final amount is confirmed before your card is charged.
            </Notice>
        ) : null;

    const summary = <Summary lines={cart.lines} totals={totals} promo={promo} setPromo={setPromo} rewardApplied={rewardApplied} setRewardApplied={setRewardApplied} unknownZip={unknownZip} pickupLabel={fulfillment === "pickup" ? `Pickup · ${pickup.place}` : undefined} />;

    const payLabel = installments ? "Continue to payment plans" : needsAddress ? "Pay now" : `Pay now · ${money(totals.total)}`;
    const payButton = (
        <Button size="lg" fullWidth isLoading={placing} isDisabled={needsAddress} iconLeading={installments ? undefined : Lock01} onPress={pay} className="caps h-14 rounded-lg text-[13px]">
            {placing ? "Placing order…" : payLabel}
        </Button>
    );
    const payNote = needsAddress ? (
        <p className="text-center text-sm text-error-primary">Add a shipping address to see tax and pay.</p>
    ) : installments ? (
        <p className="text-sm text-tertiary">
            Subject to eligibility. Installments offered through a financing partner.{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="font-semibold text-brand-secondary underline underline-offset-2">
                View sample plans
            </a>
        </p>
    ) : (
        <p className="text-center text-sm text-tertiary">By paying you agree to the course's purchase and return policy.</p>
    );

    return (
        <WebShell active="shop" footer={false}>
            <WebPage width="content">
                <PageHeader back={back} eyebrow="Secure checkout" title="Checkout" />

                {/* Mobile web: Shopify-style order summary disclosure */}
                <div className="mt-6 overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset @desktop:hidden">
                    <AriaButton
                        onPress={() => setSummaryOpen((o) => !o)}
                        aria-expanded={summaryOpen}
                        className={cx("flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left", focusRing)}
                    >
                        <span className="flex items-center gap-2 text-md font-semibold text-brand-secondary">
                            <ShoppingBag01 className="size-5" aria-hidden="true" />
                            {summaryOpen ? "Hide order summary" : "Show order summary"}
                            {summaryOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                        </span>
                        <span className="text-lg font-bold text-primary tabular-nums">{money(totals.total)}</span>
                    </AriaButton>
                    {summaryOpen && <div className="border-t border-secondary">{summary}</div>}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 @desktop:mt-8 @desktop:grid-cols-[minmax(0,1fr)_400px]">
                    {/* Left — steps */}
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel bodyClassName="flex flex-col divide-y divide-secondary">
                            {/* Contact */}
                            <PanelSection
                                label="Contact"
                                right={
                                    <a href="#" onClick={(e) => e.preventDefault()} className={cx("rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                        Not you?
                                    </a>
                                }
                            >
                                <p className="-mt-1 text-md text-secondary">
                                    {USER.email} <span className="text-tertiary">· receipts and {fulfillment === "ship" ? "tracking" : "pickup texts"} go here</span>
                                </p>
                            </PanelSection>

                            {/* Fulfillment */}
                            <PanelSection label="Delivery">
                                <AriaRadioGroup aria-label="Delivery" value={fulfillment} onChange={(v) => setFulfillment(v as Fulfillment)} className="grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                    {(
                                        [
                                            {
                                                id: "ship",
                                                icon: Truck01,
                                                title: "Ship",
                                                body: food ? "Not available for food & drinks" : totals.freeShipping ? "Ground · Free over $500" : `Ground · ${money(GROUND_SHIPPING)} · 4–7 business days`,
                                                disabled: food,
                                            },
                                            { id: "pickup", icon: Building07, title: "Pick up at the course", body: `${course.shortName} ${pickup.place} · ${pickup.ready} · Free`, disabled: false },
                                        ] as const
                                    ).map((o) => (
                                        <AriaRadio
                                            key={o.id}
                                            value={o.id}
                                            isDisabled={o.disabled}
                                            className={cx(
                                                "group flex cursor-pointer items-start gap-3 rounded-xl px-4 py-4 ring-1 ring-primary transition duration-100 ease-linear ring-inset hover:bg-primary_hover",
                                                "data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
                                                "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent",
                                            )}
                                        >
                                            <RadioDot />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2 text-md font-semibold text-primary">
                                                    <o.icon className="size-5 text-fg-quaternary" aria-hidden="true" />
                                                    {o.title}
                                                </span>
                                                <span className="mt-0.5 block text-sm text-tertiary">{o.body}</span>
                                            </span>
                                        </AriaRadio>
                                    ))}
                                </AriaRadioGroup>
                                {food && (
                                    <Notice tone="info" title="Food & drink orders are pickup only" className="rounded-lg text-sm">
                                        Everything is made fresh at the Snack Bar, so it can't be shipped. Pick it up at the clubhouse window.
                                    </Notice>
                                )}
                            </PanelSection>

                            {/* Ship to / Pick up at */}
                            {fulfillment === "ship" ? (
                                <PanelSection
                                    label="Ship to"
                                    right={
                                        address && (
                                            <AriaButton onPress={() => setShipOpen((o) => !o)} aria-expanded={shipOpen} className={cx("flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-brand-secondary", focusRing)}>
                                                {shipOpen ? "Done" : "Change"}
                                                {shipOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                                            </AriaButton>
                                        )
                                    }
                                >
                                    {!shipOpen && address ? (
                                        <div className="flex gap-3">
                                            <MarkerPin01 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                            <div className="min-w-0">
                                                <p className="text-md font-semibold text-primary">
                                                    {address.name}
                                                    {address.company && <span className="font-normal text-tertiary"> · {address.company}</span>}
                                                </p>
                                                <p className="text-sm text-tertiary">
                                                    {addressLine(address)}, US{address.phone ? `, ${address.phone}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {!address && <p className="text-sm text-tertiary">Choose where this order is going — tax depends on the destination's state, county and city.</p>}
                                            <AriaRadioGroup aria-label="Ship to" value={addressId ?? ""} onChange={(v) => setAddressId(v)} className="flex flex-col gap-2">
                                                {addresses.map((a) => (
                                                    <ChoiceRow key={a.id} value={a.id}>
                                                        <span className="flex flex-wrap items-center gap-2 text-md font-semibold text-primary">
                                                            {a.name}
                                                            {a.company && <span className="font-normal text-tertiary">· {a.company}</span>}
                                                            {a.isDefault && (
                                                                <Tag tone="gray" variant="soft">
                                                                    Default
                                                                </Tag>
                                                            )}
                                                        </span>
                                                        <span className="block text-sm text-tertiary">
                                                            {addressLine(a)}, US{a.phone ? `, ${a.phone}` : ""}
                                                        </span>
                                                    </ChoiceRow>
                                                ))}
                                            </AriaRadioGroup>
                                            <Button size="md" color="outline-brand" iconLeading={Plus} onPress={() => setAddrOpen(true)} className="mt-1 h-10 self-start rounded-lg text-sm">
                                                Use a different address
                                            </Button>
                                        </div>
                                    )}
                                </PanelSection>
                            ) : (
                                <PanelSection label="Pick up at">
                                    <div className="flex gap-3">
                                        <Building07 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                        <div className="min-w-0 text-sm text-tertiary">
                                            <p className="text-md font-semibold text-primary">
                                                {course.name} · {pickup.place}
                                            </p>
                                            <p>{course.address}</p>
                                            <p>
                                                {pickup.ready} · {pickup.hours}
                                            </p>
                                            <p className="mt-1">We'll text {USER.phone} when it's ready. Taxed at the course's rate.</p>
                                        </div>
                                    </div>
                                </PanelSection>
                            )}

                            {/* Shipping method */}
                            {fulfillment === "ship" && (
                                <PanelSection label="Shipping method">
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                                        <div>
                                            <p className="text-md font-semibold text-primary">Ground Shipping</p>
                                            <p className="text-sm text-tertiary">4 to 7 business days</p>
                                        </div>
                                        <span className={cx("text-md font-semibold tabular-nums", totals.freeShipping ? "text-success-primary" : "text-primary")}>
                                            {totals.freeShipping ? "Free" : money(GROUND_SHIPPING)}
                                        </span>
                                    </div>
                                </PanelSection>
                            )}

                            {/* Plan */}
                            {!food && (
                                <PanelSection label="Plan">
                                    <AriaRadioGroup aria-label="Plan" value={plan} onChange={(v) => setPlan(v as Plan)} className="flex flex-col gap-2">
                                        <ChoiceRow value="now">
                                            <span className="block text-md font-semibold text-primary">Pay now</span>
                                            <span className="block text-sm text-tertiary">Pay the entire amount today</span>
                                        </ChoiceRow>
                                        <ChoiceRow value="installments">
                                            <span className="flex flex-wrap items-center gap-2 text-md font-semibold text-primary">
                                                Pay in installments
                                                <Tag tone="success" variant="soft">
                                                    Prequalified
                                                </Tag>
                                            </span>
                                            <span className="block text-sm text-tertiary">Starting at {money(totals.total / 4)} / 2 weeks with no interest</span>
                                        </ChoiceRow>
                                    </AriaRadioGroup>
                                </PanelSection>
                            )}

                            {/* Payment */}
                            <PaymentSection payments={payments} setPayments={setPayments} paymentId={paymentId} setPaymentId={setPaymentId} onAdd={() => setPayOpen(true)} />
                        </Panel>

                        <div className="hidden flex-col gap-2 @desktop:flex">
                            {payButton}
                            {payNote}
                        </div>
                    </div>

                    {/* Right — order summary */}
                    <aside className="hidden @desktop:sticky @desktop:top-[140px] @desktop:block @desktop:self-start">
                        <Panel title="Order summary">{summary}</Panel>
                    </aside>
                </div>

                {/* Mobile / tablet: sticky pay bar */}
                <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-col gap-2 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">
                    {payButton}
                    {needsAddress && <p className="text-center text-xs text-error-primary">Add a shipping address to see tax and pay.</p>}
                </div>
            </WebPage>

            {addrOpen && (
                <AddressDialog
                    isOpen={addrOpen}
                    onOpenChange={setAddrOpen}
                    initialQuery={addressQuery}
                    onSave={(a) => {
                        setAddresses((as) => [...as.map((x) => (a.isDefault ? { ...x, isDefault: false } : x)), a]);
                        setAddressId(a.id);
                        setShipOpen(false);
                    }}
                />
            )}
            {payOpen && (
                <PaymentDialog
                    isOpen={payOpen}
                    onOpenChange={setPayOpen}
                    billTo={fulfillment === "ship" ? address : null}
                    onSave={(p) => {
                        setPayments((ps) => [...ps, p]);
                        setPaymentId(p.id);
                    }}
                />
            )}
        </WebShell>
    );
};

/* ---------- Gift card checkout (Nov 25) ---------- */

/** One card in Send to: who gets it and how; open, the message, their phone and who it's from. */
const SendToCard = ({ lineId, order, open, buyerName, buyerEmail }: { lineId: string; order: GiftCardOrder; open: boolean; buyerName: string; buyerEmail: string }) => {
    const me = order.recipient === "me";
    const phone = order.delivery === "email" ? order.toPhone.trim() : "";
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3">
                {me ? <Wallet02 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" /> : <Gift01 className="mt-0.5 size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />}
                <div className="min-w-0">
                    <p className="text-md font-semibold text-primary">{me ? `${buyerName} (you)` : toName(order)}</p>
                    <p className="truncate text-sm text-tertiary">{me ? "Saved to your wallet" : order.delivery === "email" ? order.toEmail.trim() : `Emailed to you to print · ${buyerEmail}`}</p>
                </div>
            </div>
            {open && !me && (
                <div className="ml-8 flex flex-col gap-2.5 rounded-lg bg-secondary px-4 py-3 text-sm">
                    <div>
                        <p className="text-tertiary">Message</p>
                        <p className="mt-0.5 text-primary">{order.message.trim() ? `“${order.message.trim()}”` : "No message"}</p>
                    </div>
                    {phone && (
                        <p className="text-tertiary">
                            Their phone <span className="font-medium text-primary tabular-nums">{phone}</span> · we'll text them the card too
                        </p>
                    )}
                    <p className="text-tertiary">
                        From <span className="font-medium text-primary">{order.fromName.trim() || buyerName}</span>
                    </p>
                    <WebLink href={giftCardsHref(order, lineId)} className={cx("inline-flex items-center gap-1 self-start rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                        <Edit03 className="size-4" aria-hidden="true" /> Edit the gift
                    </WebLink>
                </div>
            )}
        </div>
    );
};

/**
 * Checkout for a gift card order — the shop checkout's layout with Send to in place of Ship to and
 * Delivery in place of Shipping; no address, plan, rewards or discount code, and no tax. Signed
 * out, the Contact step becomes Crane Web's sign-in step (`/sign-in?next=/checkout`): the cart is
 * kept while the golfer signs in, and they come straight back here.
 */
const GiftCheckout = ({ sendToOpen, summaryOpen: initialSummaryOpen, paymentModalOpen }: { sendToOpen: boolean; summaryOpen: boolean; paymentModalOpen: boolean }) => {
    const cart = useCart();
    const { userName } = useWebSession();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const [payments, setPayments] = useState<SavedPayment[]>(SAVED_PAYMENTS);
    const [paymentId, setPaymentId] = useState(SAVED_PAYMENTS[0].id);
    const [payOpen, setPayOpen] = useState(paymentModalOpen);
    const [summaryOpen, setSummaryOpen] = useState(initialSummaryOpen);
    const [sendOpen, setSendOpen] = useState(sendToOpen);
    const [placing, setPlacing] = useState(false);

    const signedIn = !!userName;
    const gifts = giftOrdersIn(cart.lines);
    const totals = computeGiftTotals(cart.lines);
    const payment = payments.find((p) => p.id === paymentId) ?? payments[0];
    const first = gifts[0]?.order;
    // Signed out, the From the golfer typed in the builder stands in for the account.
    const buyerName = signedIn ? BUYER.name : first?.fromName.trim() || "You";
    const buyerEmail = signedIn ? BUYER.email : first?.fromEmail.trim() || "";
    const anyGift = gifts.some((g) => g.order.recipient === "someone");
    const anyForMe = gifts.some((g) => g.order.recipient === "me");
    const next = encodeURIComponent("/checkout");

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };

    const pay = () => {
        if (!signedIn) return go(`/sign-in?next=${next}`);
        if (!payment) return;
        setPlacing(true);
        window.setTimeout(() => {
            const id = placeOrder({ lines: cart.lines, kind: "gift-card", fulfillment: "email", address: null, payment, plan: "now", totals, promo: null });
            cart.clear();
            go(`/order/${id}`);
        }, 700);
    };

    const back = (
        <WebLink href="/cart" className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
        </WebLink>
    );

    const summary = (
        <div className="flex flex-col">
            <div className="px-5 py-5">
                <GiftOrderLines lines={cart.lines} />
            </div>
            <div className="border-t border-secondary px-5 py-4">
                <p className="text-sm text-tertiary">Points, rewards and discount codes can't be used on gift cards.</p>
            </div>
            <div className="border-t border-secondary px-5 py-5">
                <GiftTotalsBlock totals={totals} />
            </div>
        </div>
    );

    const payButton = (
        <Button size="lg" fullWidth isLoading={placing} iconLeading={signedIn ? Lock01 : User01} onPress={pay} className="caps h-14 rounded-lg text-[13px]">
            {placing ? "Placing order…" : signedIn ? `Pay now · ${money(totals.total)}` : "Sign in to pay"}
        </Button>
    );
    const payNote = signedIn ? (
        <p className="text-center text-sm text-tertiary">Gift cards can't be returned or exchanged for cash.</p>
    ) : (
        <p className="text-center text-sm text-tertiary">Your cart is saved while you sign in.</p>
    );

    return (
        <WebShell active="shop" footer={false}>
            <WebPage width="content">
                <PageHeader back={back} eyebrow="Secure checkout" title="Checkout" />

                {/* Mobile web: order summary disclosure */}
                <div className="mt-6 overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset @desktop:hidden">
                    <AriaButton
                        onPress={() => setSummaryOpen((o) => !o)}
                        aria-expanded={summaryOpen}
                        className={cx("flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left", focusRing)}
                    >
                        <span className="flex items-center gap-2 text-md font-semibold text-brand-secondary">
                            <ShoppingBag01 className="size-5" aria-hidden="true" />
                            {summaryOpen ? "Hide order summary" : "Show order summary"}
                            {summaryOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                        </span>
                        <span className="text-lg font-bold text-primary tabular-nums">{money(totals.total)}</span>
                    </AriaButton>
                    {summaryOpen && <div className="border-t border-secondary">{summary}</div>}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 @desktop:mt-8 @desktop:grid-cols-[minmax(0,1fr)_400px]">
                    {/* Left — steps */}
                    <div className="flex min-w-0 flex-col gap-5">
                        <Panel bodyClassName="flex flex-col divide-y divide-secondary">
                            {/* Contact, or the sign-in step for a guest */}
                            {signedIn ? (
                                <PanelSection
                                    label="Contact"
                                    right={
                                        <a href="#" onClick={(e) => e.preventDefault()} className={cx("rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                            Not you?
                                        </a>
                                    }
                                >
                                    <p className="-mt-1 text-md text-secondary">
                                        {BUYER.email} <span className="text-tertiary">· your receipt and gift card email go here</span>
                                    </p>
                                </PanelSection>
                            ) : (
                                <PanelSection label="Sign in to pay">
                                    <p className="-mt-1 max-w-xl text-md text-tertiary">
                                        Gift cards are paid for with your TenFore account, the same one you use in the Crane app. Your cart is saved, and you'll come right back here.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <LinkButton href={`/sign-in?next=${next}`}>Sign in</LinkButton>
                                        <LinkButton href={`/sign-up?next=${next}`} color="outline">
                                            Create an account
                                        </LinkButton>
                                    </div>
                                </PanelSection>
                            )}

                            {/* Send to, in place of Ship to */}
                            <PanelSection
                                label={anyGift ? "Send to" : "For"}
                                right={
                                    anyGift && (
                                        <AriaButton onPress={() => setSendOpen((o) => !o)} aria-expanded={sendOpen} className={cx("flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-brand-secondary", focusRing)}>
                                            {sendOpen ? "Hide details" : "Show details"}
                                            {sendOpen ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                                        </AriaButton>
                                    )
                                }
                            >
                                <div className="flex flex-col gap-5">
                                    {gifts.map((g) => (
                                        <SendToCard key={g.lineId} lineId={g.lineId} order={g.order} open={sendOpen} buyerName={buyerName} buyerEmail={buyerEmail} />
                                    ))}
                                </div>
                            </PanelSection>

                            {/* Delivery, in place of Shipping */}
                            <PanelSection label="Delivery">
                                {anyGift && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                                        <div>
                                            <p className="text-md font-semibold text-primary">Email</p>
                                            <p className="text-sm text-tertiary">Sent today, right after you pay</p>
                                        </div>
                                        <span className="text-md font-semibold text-success-primary">Free</span>
                                    </div>
                                )}
                                {anyForMe && (
                                    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-4 py-3">
                                        <div>
                                            <p className="text-md font-semibold text-primary">Wallet</p>
                                            <p className="text-sm text-tertiary">Ready to use right after you pay</p>
                                        </div>
                                        <span className="text-md font-semibold text-success-primary">Free</span>
                                    </div>
                                )}
                            </PanelSection>

                            {/* Payment — unchanged from shop checkout once signed in */}
                            {signedIn ? (
                                <PaymentSection payments={payments} setPayments={setPayments} paymentId={paymentId} setPaymentId={setPaymentId} onAdd={() => setPayOpen(true)} />
                            ) : (
                                <PanelSection label="Payment" right={<span className="flex items-center gap-1 text-xs text-tertiary"><Lock01 className="size-3.5" aria-hidden="true" /> Encrypted</span>}>
                                    <p className="-mt-1 text-sm text-tertiary">Your saved cards show here once you're signed in, or you can add one.</p>
                                </PanelSection>
                            )}
                        </Panel>

                        <div className="hidden flex-col gap-2 @desktop:flex">
                            {payButton}
                            {payNote}
                        </div>
                    </div>

                    {/* Right — order summary */}
                    <aside className="hidden @desktop:sticky @desktop:top-[140px] @desktop:block @desktop:self-start">
                        <Panel title="Order summary">{summary}</Panel>
                    </aside>
                </div>

                {/* Mobile / tablet: sticky pay bar */}
                <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-col gap-2 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">
                    {payButton}
                </div>
            </WebPage>

            {payOpen && (
                <PaymentDialog
                    isOpen={payOpen}
                    onOpenChange={setPayOpen}
                    billTo={null}
                    onSave={(p) => {
                        setPayments((ps) => [...ps, p]);
                        setPaymentId(p.id);
                    }}
                />
            )}
        </WebShell>
    );
};
