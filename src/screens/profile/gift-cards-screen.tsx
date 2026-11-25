import { Button as AriaButton } from "react-aria-components";
import { CheckCircle, ChevronRight, Gift01, Plus, XClose } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { GlassIconButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { GiftArtThumb } from "@/components/gift-cards/gift-art-card";
import { useStack } from "@/components/prototype/stack-navigator";
import { liveDeals, money0 } from "@/data/gift-cards";
import { GroupLabel, SentGiftItem } from "./gift-card-parts";
import { purchaseNotice, useGiftCards, type GiftPurchase, type WalletGiftCard, type WalletSentGift } from "./gift-cards-store";
import { ProfileNav } from "./profile-shared";
import { GiftCardItem } from "./wallet-cards";

export interface GiftCardsScreenProps {
    /** Defaults to the wallet (IMG_8577 plus anything bought this session). Pass [] for the empty state (IMG_2189). */
    cards?: WalletGiftCard[];
    /** Gifts bought for someone else. Defaults to the wallet's Sent as gifts. */
    sent?: WalletSentGift[];
    /** The success notice after paying. Defaults to the last purchase until it's closed; null hides it. */
    notice?: GiftPurchase | null;
}

/** "Pay $50, get a $60 card": the first live deal, as the Buy a gift card row's teaser. */
const dealTeaser = () => {
    const d = liveDeals()[0];
    return d ? `Pay ${money0(d.price)}, get a ${money0(d.value)} card` : "Send one today, or keep it for yourself";
};

/** The prominent Buy a gift card row at the top of the list. */
const BuyRow = ({ onPress }: { onPress: () => void }) => (
    <AriaButton
        onPress={onPress}
        className="flex w-full cursor-pointer items-center gap-3 rounded-ios-card bg-primary p-3 pr-3 text-left shadow-ios-card ring-1 ring-secondary/60 outline-none transition duration-100 ease-linear data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[pressed]:bg-primary_hover"
    >
        <GiftArtThumb designId="birthday-gift" className="w-[72px] rounded-lg" />
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-ios-headline text-primary">Buy a gift card</span>
            <span className="truncate text-ios-subheadline font-medium text-brand-secondary">{dealTeaser()}</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
    </AriaButton>
);

/** "Your $60 gift card is in your wallet" / "Your gift to Alex Rivera is on its way", with a close button. */
const PurchaseNotice = ({ purchase, onClose }: { purchase: GiftPurchase; onClose?: () => void }) => {
    const { title, body } = purchaseNotice(purchase);
    return (
        <div role="status" className="flex gap-2.5 rounded-ios-control bg-success-primary py-3 pr-2 pl-3.5">
            <CheckCircle className="mt-0.5 size-[18px] shrink-0 text-fg-success-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-ios-subheadline text-primary">
                <div className="font-semibold">{title}</div>
                {body}
            </div>
            {onClose && (
                <AriaButton
                    aria-label="Close"
                    onPress={onClose}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg-quaternary outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-brand data-[pressed]:bg-black/5"
                >
                    <XClose className="size-4" aria-hidden="true" />
                </AriaButton>
            )}
        </div>
    );
};

/**
 * Gift Cards — your cards (balance, code, spend categories; expired cards dimmed) and the gifts
 * you've sent. Buy a gift card pushes the builder; tapping a card opens it with its barcode and QR.
 */
export const GiftCardsScreen = ({ cards: cardsProp, sent: sentProp, notice: noticeProp }: GiftCardsScreenProps) => {
    const { push } = useStack();
    const wallet = useGiftCards();
    const cards = cardsProp ?? wallet.cards;
    const sent = sentProp ?? wallet.sent;
    const notice = noticeProp !== undefined ? noticeProp : wallet.noticeOpen ? wallet.lastPurchase : null;
    const buy = () => push("buy-gift-card");

    return (
        <Screen nav={<ProfileNav title="Gift Cards" trailing={<GlassIconButton icon={Plus} aria-label="Buy a gift card" onPress={buy} />} />}>
            {cards.length === 0 && sent.length === 0 ? (
                <EmptyState
                    icon={Gift01}
                    title="No gift cards found"
                    action={
                        <Button size="md" iconLeading={Plus} onPress={buy}>
                            Buy a gift card
                        </Button>
                    }
                />
            ) : (
                <div className="flex flex-col gap-3 px-gutter pt-4">
                    {notice && <PurchaseNotice purchase={notice} onClose={noticeProp === undefined ? wallet.closeNotice : undefined} />}
                    <BuyRow onPress={buy} />

                    <GroupLabel className="mt-3">Your gift cards</GroupLabel>
                    {cards.length === 0 ? (
                        <p className="rounded-ios-card bg-primary px-4 py-3.5 text-ios-subheadline text-tertiary shadow-ios-card ring-1 ring-secondary/60">No gift cards in your wallet yet.</p>
                    ) : (
                        cards.map((c) => <GiftCardItem key={c.id} card={c} onPress={() => push("gift-card", { id: c.id })} />)
                    )}

                    {sent.length > 0 && (
                        <>
                            <GroupLabel className="mt-3">Sent as gifts</GroupLabel>
                            {sent.map((g) => (
                                <SentGiftItem key={g.id} gift={g} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </Screen>
    );
};
