import { Gift01, Wallet02 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Card } from "@/components/base/card";
import { QRCode } from "@/components/base/qr-code";
import { Screen } from "@/components/device/screen";
import { Notice } from "@/components/feedback/notice";
import { useToast } from "@/components/feedback/toast";
import { GiftArtCard } from "@/components/gift-cards/gift-art-card";
import { UpcBarcode } from "@/components/gift-cards/upc-barcode";
import { KeyValueRow } from "@/components/lists/list";
import { currency, formatDate } from "@/data/crane";
import { CLUB_NAME, CLUB_SHORT, GOOD_FOR, SAMPLE_SELF_ORDER, designById, groupCode, money0 } from "@/data/gift-cards";
import { GroupLabel, NewPill } from "./gift-card-parts";
import { NEW_CARD_ID, WALLET_GIFT_CARDS, isUpc, useGiftCards, walletCardFrom, type WalletGiftCard } from "./gift-cards-store";
import { ProfileNav } from "./profile-shared";
import { WalletStatusBadge, giftCardStatus } from "./wallet-cards";

export interface GiftCardDetailScreenProps {
    /** Route param: the wallet card's id (`#/profile/gift-cards/gift-card:gc-new`). */
    id?: string;
    /** Show this card instead of looking one up (stories). */
    card?: WalletGiftCard;
}

/** Older cards without a design: a plain brand card face. */
const PlainCardFace = ({ value }: { value: number }) => (
    <div className="relative isolate aspect-[3/2] w-full overflow-hidden rounded-xl bg-brand-solid shadow-md ring-1 ring-black/10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-br from-white/10 via-transparent to-black/30" />
        <div className="flex h-full flex-col justify-between p-4 text-white">
            <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold">{CLUB_SHORT}</span>
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                    <Gift01 className="size-3.5" aria-hidden="true" />
                    Gift card
                </span>
            </div>
            <span className="text-display-sm font-bold tracking-tight tabular-nums">{money0(value)}</span>
        </div>
    </div>
);

/**
 * The barcode and QR for the Pro Shop counter. Always drawn black on white (both modes) with a
 * quiet zone, so a scanner reads it. 12-digit ids get a UPC-A barcode; other codes get the QR only.
 */
const ScanCodes = ({ code }: { code: string }) => {
    const upc = isUpc(code);
    return (
        <div className="rounded-ios-card bg-white px-5 pt-5 pb-4 text-black shadow-ios-card ring-1 ring-secondary/60">
            {/* 260pt wide leaves the 9-module quiet zone either side inside the card's padding. */}
            {upc && <UpcBarcode value={code} className="mx-auto h-[88px] w-[260px] text-black" />}
            <div className={upc ? "mt-4 flex items-center gap-4 border-t border-black/10 pt-4" : "flex flex-col items-center gap-3"}>
                <QRCode value={code} size={upc ? 112 : 180} className="shrink-0 text-black" />
                <div className={upc ? "min-w-0" : "text-center"}>
                    <div className="text-ios-footnote font-medium tracking-[0.02em] text-black/55 uppercase">Gift Card ID</div>
                    <div className="font-mono text-[22px] leading-7 font-semibold tracking-wide tabular-nums">{groupCode(code)}</div>
                    <p className="mt-1 text-ios-footnote text-black/60">Scan at the Pro Shop counter, or enter the ID at checkout.</p>
                </div>
            </div>
        </div>
    );
};

/** Look a card up in the wallet; the deep link to a card bought in an earlier session gets the sample new card. */
const findCard = (cards: WalletGiftCard[], id?: string) =>
    cards.find((c) => c.id === id) ?? WALLET_GIFT_CARDS.find((c) => c.id === id) ?? (id && !id.startsWith(NEW_CARD_ID) ? cards[0] : walletCardFrom(SAMPLE_SELF_ORDER));

/**
 * Gift Card — the card face, balance, and the Gift Card ID as a UPC-A barcode and QR to scan at
 * the Pro Shop counter (the reason to open it on a phone), then what it's good for.
 */
export const GiftCardDetailScreen = ({ id, card: cardProp }: GiftCardDetailScreenProps) => {
    const wallet = useGiftCards();
    const toast = useToast();
    const card = cardProp ?? findCard(wallet.cards, id);
    const status = giftCardStatus(card);
    const usable = status === "available";
    const balance = card.amount - card.used;
    const design = card.designId ? designById(card.designId) : undefined;

    return (
        <Screen nav={<ProfileNav title="Gift Card" backIconOnly />}>
            <div className="flex flex-col gap-4 px-gutter pt-4">
                {design ? <GiftArtCard designId={design.id} value={card.amount} /> : <PlainCardFace value={card.amount} />}

                <Card className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-ios-subheadline text-tertiary">
                            Balance
                            {card.isNew && <NewPill />}
                        </div>
                        <div className="text-[34px] leading-[41px] font-bold tracking-[0.4px] text-fg-brand-secondary tabular-nums">{currency(balance)}</div>
                        {card.used > 0 && (
                            <div className="text-ios-footnote text-tertiary tabular-nums">
                                Original {currency(card.amount)} · Used {currency(card.used)}
                            </div>
                        )}
                    </div>
                    <WalletStatusBadge status={status} />
                </Card>

                {usable ? (
                    <div className="flex flex-col gap-2">
                        <GroupLabel>Pay at the Pro Shop</GroupLabel>
                        <ScanCodes code={card.code} />
                    </div>
                ) : (
                    <Notice tone="info" title={status === "expired" ? "This card has expired" : "This card is used up"}>
                        There's nothing left to spend. Gift Card ID {groupCode(card.code)}.
                    </Notice>
                )}

                <div className="flex flex-col gap-2">
                    <GroupLabel>Details</GroupLabel>
                    <Card padding="none" className="divide-y divide-border-secondary px-4">
                        <KeyValueRow label="Expires" value={card.noExpiry ? "Doesn't expire" : formatDate(card.expires)} />
                        <div className="py-2.5">
                            <div className="text-ios-subheadline text-tertiary">Good for</div>
                            <p className="mt-0.5 text-ios-subheadline text-primary">
                                {card.designId ? `${GOOD_FOR[0].toUpperCase()}${GOOD_FOR.slice(1)} at ${CLUB_NAME}.` : `${card.categories.join(", ")}.`}
                            </p>
                        </div>
                        {design && <KeyValueRow label="Design" value={design.name} />}
                        {card.purchased && <KeyValueRow label="Purchased" value={formatDate(card.purchased)} />}
                        {card.orderNumber && <KeyValueRow label="Order" value={`#${card.orderNumber}`} />}
                    </Card>
                    <p className="px-1 text-ios-footnote text-tertiary">Gift cards can't be returned or exchanged for cash.</p>
                </div>

                {usable && (
                    <Button
                        color="black"
                        size="lg"
                        fullWidth
                        iconLeading={Wallet02}
                        onPress={() => toast.show({ title: "Gift card added to Apple Wallet", icon: Wallet02 })}
                    >
                        Add to Apple Wallet
                    </Button>
                )}
            </div>
        </Screen>
    );
};
