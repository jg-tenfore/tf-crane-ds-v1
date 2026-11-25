import { motion } from "motion/react";
import { Check, CreditCard02, Download01, Gift01, Mail01, Printer, Send01, ShoppingBag03, Wallet02 } from "@untitledui/icons";
import { Pill, StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Card, Section } from "@/components/base/card";
import { GlassPillButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { useToast } from "@/components/feedback/toast";
import { GiftArtCard } from "@/components/gift-cards/gift-art-card";
import { KeyValueRow } from "@/components/lists/list";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { useStack } from "@/components/prototype/stack-navigator";
import { BUYER, CLUB_NAME, CLUB_SHORT, GOOD_FOR, deliveryLine, designById, groupCode, maskCode, money, money0, orderBonus, orderPrice, orderValue, toName } from "@/data/gift-cards";
import { GiftThumb } from "./gift-card-parts";
import { SAMPLE_PURCHASES, isPurchaseKind, useGiftCards, type GiftPurchase } from "./gift-cards-store";

export interface GiftCardBoughtScreenProps {
    /** Route param: `gift`, `print` or `me` (`#/profile/gift-cards/gift-card-bought:me`). */
    id?: string;
    /** Show this purchase (stories). Otherwise the one just paid for, or the sample for `id`. */
    purchase?: GiftPurchase;
}

const longDate = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** The purchase to show: the prop, the one just paid for (when it matches the route), or a sample. */
const usePurchase = (id?: string, prop?: GiftPurchase) => {
    const { lastPurchase } = useGiftCards();
    if (prop) return prop;
    if (lastPurchase && (!isPurchaseKind(id) || lastPurchase.kind === id)) return lastPurchase;
    return SAMPLE_PURCHASES[isPurchaseKind(id) ? id : "gift"];
};

/**
 * Gift card confirmation — the content and order of the shop's confirmation (2.4), for the phone:
 * check, thanks and where the card went; the order number and card face; Items, Delivery, Payment
 * details and Gift card details (code masked for a gift, full for yourself); then what's next.
 */
export const GiftCardBoughtScreen = ({ id, purchase: purchaseProp }: GiftCardBoughtScreenProps) => {
    const { pop, replace } = useStack();
    const toast = useToast();
    const p = usePurchase(id, purchaseProp);
    const o = p.order;
    const value = orderValue(o);
    const price = orderPrice(o);
    const bonus = orderBonus(o);
    const who = toName(o);
    const first = o.fromName.trim().split(/\s+/)[0] || BUYER.firstName;

    const line = p.kind === "me" ? `Your ${money0(value)} gift card is in your wallet.` : p.kind === "print" ? `We've emailed the printable card to ${o.fromEmail}.` : `${who} gets the card by email today.`;
    const pill = p.kind === "me" ? "Saved to your wallet" : p.kind === "print" ? "Emailed to you to print" : `Emailed to ${who} today`;
    const PillIcon = p.kind === "me" ? Wallet02 : p.kind === "print" ? Printer : Mail01;

    return (
        <Screen nav={<NavigationBar title="Confirmation" trailing={<GlassPillButton onPress={pop}>Done</GlassPillButton>} />}>
            <div className="flex flex-col gap-6 pt-6 pb-6">
                <header className="flex flex-col items-center px-gutter text-center">
                    <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 380, damping: 18 }}
                        className="flex size-16 items-center justify-center rounded-full bg-success-solid text-white shadow-ios-card"
                    >
                        <Check className="size-8" strokeWidth={3} aria-hidden="true" />
                    </motion.span>
                    <div className="mt-3 text-ios-footnote font-semibold tracking-[0.06em] text-tertiary uppercase">
                        Order confirmation · <span className="tabular-nums">#{p.orderNumber}</span>
                    </div>
                    <h1 className="mt-1 text-ios-title1 text-primary">Thank you, {first}!</h1>
                    <p className="mt-1 text-ios-subheadline text-tertiary">Your gift card order is confirmed. {line}</p>
                    <Pill icon={PillIcon} className="mt-3">
                        {pill}
                    </Pill>
                </header>

                <div className="px-gutter">
                    <GiftArtCard designId={o.designId} value={value} className="mx-auto max-w-[300px]" />
                </div>

                <Section title="Items (1)" icon={ShoppingBag03} accessory={<StatusBadge tone="success">Paid</StatusBadge>}>
                    <Card className="flex gap-3">
                        <GiftThumb designId={o.designId} className="mt-0.5" />
                        <div className="min-w-0 flex-1">
                            <div className="text-ios-headline text-primary">
                                {money0(value)} {CLUB_SHORT} gift card
                            </div>
                            <div className="text-ios-footnote text-tertiary">
                                {designById(o.designId).name} · {deliveryLine(o)}
                            </div>
                            <div className="mt-1 flex items-baseline justify-between gap-2">
                                <span className="text-ios-footnote font-medium text-success-primary">{bonus > 0 && `Deal: pay ${money0(price)}, get a ${money0(value)} card`}</span>
                                <span className="text-ios-headline text-primary tabular-nums">{money(price)}</span>
                            </div>
                        </div>
                    </Card>
                </Section>

                <Section title="Delivery" icon={Send01}>
                    <Card padding="none" className="divide-y divide-border-secondary px-4">
                        <div className="py-3">
                            <div className="text-ios-footnote font-semibold tracking-[0.06em] text-tertiary uppercase">{p.kind === "me" ? "For" : "Send to"}</div>
                            {p.kind === "me" ? (
                                <>
                                    <div className="text-ios-headline text-primary">{o.fromName} (you)</div>
                                    <div className="text-ios-subheadline text-tertiary">Saved to your wallet</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-ios-headline text-primary">{who}</div>
                                    <div className="text-ios-subheadline break-words text-tertiary">{p.kind === "print" ? `Emailed to you to print · ${o.fromEmail}` : o.toEmail}</div>
                                    {p.kind === "gift" && o.toPhone.trim() && <div className="text-ios-subheadline text-tertiary">Their phone {o.toPhone} · we'll also text them the card</div>}
                                    <div className="text-ios-footnote text-tertiary">From {o.fromName}</div>
                                </>
                            )}
                        </div>
                        <div className="py-3">
                            <div className="text-ios-footnote font-semibold tracking-[0.06em] text-tertiary uppercase">Method</div>
                            <div className="text-ios-headline text-primary">{p.kind === "me" ? "Wallet · Today" : "Email · Today"}</div>
                            {p.kind !== "me" && o.message.trim() && <p className="mt-1 text-ios-subheadline text-secondary italic">“{o.message.trim()}”</p>}
                        </div>
                    </Card>
                </Section>

                <Section title="Payment details" icon={CreditCard02}>
                    <Card padding="none" className="px-4 py-2">
                        <KeyValueRow label="Subtotal · 1 item" value={money(price)} className="py-1.5" />
                        {bonus > 0 && <KeyValueRow label="Deal bonus (card value)" value={<span className="text-success-primary">+{money(bonus)}</span>} className="py-1.5" />}
                        <KeyValueRow label={p.kind === "me" ? "Delivery — wallet" : "Delivery — email"} value="Free" className="py-1.5" />
                        <KeyValueRow label="Taxes" value={money(0)} className="py-1.5" />
                        <div className="mt-1 border-t border-secondary pt-1">
                            <KeyValueRow label="Total charged" value={money(price)} tone="emphasis" className="py-1.5" />
                        </div>
                        <KeyValueRow label="Paid with" value={`${p.paidWith.brand} •••• ${p.paidWith.last4}`} className="py-1.5" />
                    </Card>
                    <p className="mt-2 px-1 text-ios-footnote text-tertiary">
                        Paid in the app on {longDate(p.date)}. We emailed your receipt to {o.fromEmail || BUYER.email}.
                    </p>
                    <Button size="sm" color="plain" iconLeading={Download01} className="mt-1" onPress={() => toast.show({ title: "Receipt saved to Files", icon: Download01 })}>
                        Download PDF receipt
                    </Button>
                </Section>

                <Section title="Gift card details" icon={Gift01}>
                    <Card padding="none" className="px-4 py-2">
                        <KeyValueRow label="Gift Card ID" value={<span className="font-mono tracking-wide">{p.kind === "me" ? groupCode(p.code) : maskCode(p.code)}</span>} />
                        <p className="pb-2.5 text-ios-subheadline text-tertiary">
                            Good for {GOOD_FOR} at {CLUB_NAME}. It doesn't expire, and gift cards can't be returned or exchanged for cash.
                        </p>
                    </Card>
                </Section>

                <div className="flex flex-col gap-2.5 px-gutter">
                    {p.kind === "me" ? (
                        <Button fullWidth iconLeading={Wallet02} onPress={() => replace("gift-card", { id: p.cardId })}>
                            See it in your wallet
                        </Button>
                    ) : (
                        <Button fullWidth iconLeading={Gift01} onPress={pop}>
                            See your gift cards
                        </Button>
                    )}
                    <Button fullWidth color="gray" onPress={() => replace("buy-gift-card")}>
                        Buy another gift card
                    </Button>
                    <p className="mt-2 text-center text-ios-footnote text-tertiary">Need help? Contact the pro shop.</p>
                </div>
            </div>
        </Screen>
    );
};
