import { useState, type ReactNode } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { ArrowLeft, Lock01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { GiftArtCard } from "@/components/gift-cards/gift-art-card";
import { BottomSheet } from "@/components/overlays/bottom-sheet";
import { PAYMENT_CARDS, type PaymentCard } from "@/data/crane";
import { BUYER, CLUB_SHORT, designById, money, money0, orderPrice, orderValue, toName, type GiftCardOrder } from "@/data/gift-cards";
import { GiftTotals, GroupLabel } from "./gift-card-parts";
import { useGiftCards, type GiftPurchase } from "./gift-cards-store";

export interface GiftCardReviewSheetProps {
    order: GiftCardOrder;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** After Pay: the order is recorded in the wallet. The builder swaps itself for the confirmation. */
    onPaid?: (purchase: GiftPurchase) => void;
    /** Saved cards to pay with (defaults to the app's). */
    cards?: PaymentCard[];
}

const Box = ({ children }: { children: ReactNode }) => <div className="rounded-ios-control bg-secondary px-4 py-3">{children}</div>;

/** Send to (or For): who gets it and how, with the message, their phone and who it's from. */
const SendTo = ({ order }: { order: GiftCardOrder }) => {
    if (order.recipient === "me") {
        return (
            <Box>
                <div className="text-ios-headline text-primary">{order.fromName || BUYER.name} (you)</div>
                <div className="text-ios-subheadline text-tertiary">Saved to your wallet</div>
            </Box>
        );
    }
    const phone = order.delivery === "email" && order.toPhone.trim();
    return (
        <Box>
            <div className="text-ios-headline text-primary">{toName(order)}</div>
            <div className="text-ios-subheadline break-words text-tertiary">{order.delivery === "email" ? order.toEmail : `Emailed to you to print · ${order.fromEmail}`}</div>
            {phone && <div className="text-ios-subheadline text-tertiary">Their phone {phone} · we'll also text them the card</div>}
            {order.message.trim() && <p className="mt-2 line-clamp-3 text-ios-subheadline text-secondary italic">“{order.message.trim()}”</p>}
            <div className="mt-2 text-ios-footnote text-tertiary">From {order.fromName}</div>
        </Box>
    );
};

/** "Email · Sent today · Free" / "Wallet · Ready to use · Free". */
const Delivery = ({ order }: { order: GiftCardOrder }) => {
    const [method, when] =
        order.recipient === "me" ? ["Wallet", "Ready to use right after you pay"] : order.delivery === "print" ? ["Email to you to print", "Sent today, right after you pay"] : ["Email", "Sent today, right after you pay"];
    return (
        <Box>
            <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-ios-headline text-primary">{method}</div>
                    <div className="text-ios-subheadline text-tertiary">{when}</div>
                </div>
                <span className="text-ios-subheadline font-semibold text-primary">Free</span>
            </div>
        </Box>
    );
};

/**
 * Review and pay — the app's summary-sheet pattern (as Configure Booking's summary step): the card
 * face, Send to / For, Delivery, a saved card to pay with and the totals, then Pay. Gift cards have
 * no shipping or tax and can't take points, rewards or discount codes.
 */
export const GiftCardReviewSheet = ({ order, isOpen, onOpenChange, onPaid, cards = PAYMENT_CARDS }: GiftCardReviewSheetProps) => {
    const { pay } = useGiftCards();
    const [cardId, setCardId] = useState(cards[0]?.id ?? "");
    const [paying, setPaying] = useState(false);
    const value = orderValue(order);
    const price = orderPrice(order);
    const card = cards.find((c) => c.id === cardId);

    const onPay = () => {
        if (!card) return;
        setPaying(true);
        window.setTimeout(() => {
            const purchase = pay(order, card);
            setPaying(false);
            onOpenChange(false);
            onPaid?.(purchase);
        }, 900);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onOpenChange={(open) => !paying && onOpenChange(open)}
            title="Review and pay"
            detent="full"
            footer={
                <div className="flex gap-3">
                    <Button color="outline-brand" size="lg" iconLeading={ArrowLeft} onPress={() => onOpenChange(false)} isDisabled={paying} className="w-[110px]">
                        Back
                    </Button>
                    <Button size="lg" fullWidth iconLeading={Lock01} isLoading={paying} isDisabled={!card} onPress={onPay} className="flex-1">
                        Pay {money(price)}
                    </Button>
                </div>
            }
        >
            <div className="flex flex-col gap-5 px-5 pt-4 pb-5">
                <div className="flex flex-col items-center gap-2">
                    <GiftArtCard designId={order.designId} value={value} className="max-w-[260px]" />
                    <div className="text-center">
                        <div className="text-ios-headline text-primary">
                            {money0(value)} {CLUB_SHORT} gift card
                        </div>
                        <div className="text-ios-footnote text-tertiary">{designById(order.designId).name} design</div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <GroupLabel>{order.recipient === "me" ? "For" : "Send to"}</GroupLabel>
                    <SendTo order={order} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <GroupLabel>Delivery</GroupLabel>
                    <Delivery order={order} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <GroupLabel id="gift-pay-with">Pay with</GroupLabel>
                    {cards.length === 0 ? (
                        <Notice tone="warning">Add a card in Profile › Payment Methods to pay.</Notice>
                    ) : (
                        <AriaRadioGroup aria-labelledby="gift-pay-with" value={cardId} onChange={setCardId} isDisabled={paying} className="flex flex-col gap-2">
                            {cards.map((c) => (
                                <AriaRadio
                                    key={c.id}
                                    value={c.id}
                                    className="group flex cursor-pointer items-center gap-3 rounded-ios-control bg-secondary px-4 py-3 ring-1 ring-transparent outline-none transition duration-100 ease-linear ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-primary_alt data-[selected]:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary group-data-[selected]:ring-2 group-data-[selected]:ring-fg-brand-primary">
                                        <span className="size-3 rounded-full bg-fg-brand-primary opacity-0 group-data-[selected]:opacity-100" />
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="flex items-baseline justify-between gap-2">
                                            <span className="text-ios-headline text-primary uppercase">{c.brand}</span>
                                            <span className="text-ios-subheadline text-tertiary tabular-nums">•••• {c.last4}</span>
                                        </span>
                                        <span className="text-ios-footnote text-tertiary">
                                            {c.name} · Exp {c.exp}
                                        </span>
                                    </span>
                                </AriaRadio>
                            ))}
                        </AriaRadioGroup>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <GroupLabel>Summary</GroupLabel>
                    <div className="rounded-ios-control bg-secondary px-4 py-2">
                        <GiftTotals value={value} price={price} />
                    </div>
                    <p className="px-1 text-ios-footnote text-tertiary">Gift cards have no shipping or tax. Points, rewards and discount codes can't be used on them.</p>
                </div>
            </div>
        </BottomSheet>
    );
};
