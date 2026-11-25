import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { upcCheckDigit } from "@/components/gift-cards/upc-barcode";
import { GIFT_CARDS, PAYMENT_CARDS, TODAY, type GiftCard, type PaymentCard } from "@/data/crane";
import {
    GIFT_ORDER_NUMBER,
    SAMPLE_GIFT_CARD_ID,
    SAMPLE_GIFT_ORDER,
    SAMPLE_SELF_ORDER,
    SENT_GIFTS,
    orderValue,
    sentGiftFrom,
    toName,
    type GiftCardOrder,
    type SentGift,
} from "@/data/gift-cards";

/**
 * The iPhone app's gift cards: Profile › Gift Cards (your cards + Sent as gifts), what a paid
 * order becomes, and the in-memory store the buy flow writes to. Built on src/data/gift-cards.ts.
 */

/* ------------------------------------------------------------------ */
/* Wallet cards and sent gifts                                         */
/* ------------------------------------------------------------------ */

/** A card in Profile › Gift Cards: Crane's GiftCard plus the art it was bought with. */
export interface WalletGiftCard extends GiftCard {
    /** The builder design (art thumbnail and card face). Older cards have none and show the gift icon. */
    designId?: string;
    /** Bought this session: the green "New" pill. */
    isNew?: boolean;
    /** Cards from the builder don't expire ("Doesn't expire"). */
    noExpiry?: boolean;
    purchased?: Date;
    orderNumber?: string;
}

export interface WalletSentGift extends SentGift {
    isNew?: boolean;
}

/** The spend categories (the app's chips) on a card bought in the builder. */
export const GIFT_CARD_CATEGORIES = ["Tee Fees", "Merchandise", "Food & Beverage", "Alcohol"];

/** The sample wallet: the app's existing cards, with art on the one still in use. */
export const WALLET_GIFT_CARDS: WalletGiftCard[] = GIFT_CARDS.map((c) => (c.id === "gc-1" ? { ...c, designId: "clubhouse-lights" } : c));

/** Builder cards never expire; this date only keeps walletStatus() happy. */
const NO_EXPIRY = new Date(2099, 11, 31);

/** The id the first card bought this session gets (deep link `#/profile/gift-cards/gift-card:gc-new`). */
export const NEW_CARD_ID = "gc-new";
export const NEW_SENT_ID = "sg-new";

/** The wallet card a paid "Me" order becomes. */
export const walletCardFrom = (o: GiftCardOrder, id = NEW_CARD_ID, code = SAMPLE_GIFT_CARD_ID): WalletGiftCard => ({
    id,
    code,
    expires: NO_EXPIRY,
    amount: orderValue(o),
    used: 0,
    categories: GIFT_CARD_CATEGORIES,
    designId: o.designId,
    isNew: true,
    noExpiry: true,
    purchased: TODAY,
    orderNumber: GIFT_ORDER_NUMBER,
});

/** The Sent as gifts row a paid gift order becomes. */
export const walletSentFrom = (o: GiftCardOrder, id = NEW_SENT_ID): WalletSentGift => ({ ...sentGiftFrom(o, id), isNew: true });

/** Is this a 12-digit UPC-A with a valid check digit (so it can be drawn as a barcode)? */
export const isUpc = (code: string) => /^\d{12}$/.test(code) && upcCheckDigit(code.slice(0, 11)) === Number(code[11]);

/** A fresh 12-digit Gift Card ID (11 digits + the UPC-A check digit). */
const newGiftCardId = () => {
    const eleven = Array.from({ length: 11 }, (_, i) => (i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10))).join("");
    return eleven + upcCheckDigit(eleven);
};

/* ------------------------------------------------------------------ */
/* Purchases                                                           */
/* ------------------------------------------------------------------ */

/** gift = emailed to them · print = emailed to the buyer to print · me = saved to the wallet. */
export type PurchaseKind = "gift" | "print" | "me";
export const purchaseKind = (o: GiftCardOrder): PurchaseKind => (o.recipient === "me" ? "me" : o.delivery === "print" ? "print" : "gift");
export const isPurchaseKind = (v: unknown): v is PurchaseKind => v === "gift" || v === "print" || v === "me";

export interface GiftPurchase {
    order: GiftCardOrder;
    kind: PurchaseKind;
    orderNumber: string;
    /** The 12-digit Gift Card ID. The buyer of a gift only ever sees it masked. */
    code: string;
    paidWith: PaymentCard;
    date: Date;
    /** The wallet card ("me") or the Sent as gifts row (gift / print). */
    cardId?: string;
    sentId?: string;
}

/** A paid order, worked out from the order alone (stories, deep links, and the store's `pay`). */
export const purchaseFrom = (order: GiftCardOrder, paidWith: PaymentCard = PAYMENT_CARDS[0], ids: { cardId?: string; sentId?: string; code?: string } = {}): GiftPurchase => {
    const kind = purchaseKind(order);
    return {
        order,
        kind,
        orderNumber: GIFT_ORDER_NUMBER,
        code: ids.code ?? SAMPLE_GIFT_CARD_ID,
        paidWith,
        date: TODAY,
        cardId: kind === "me" ? (ids.cardId ?? NEW_CARD_ID) : undefined,
        sentId: kind === "me" ? undefined : (ids.sentId ?? NEW_SENT_ID),
    };
};

/** The print-at-home version of the sample gift. */
export const SAMPLE_PRINT_ORDER: GiftCardOrder = { ...SAMPLE_GIFT_ORDER, delivery: "print", toEmail: "", toEmailConfirm: "" };

/** One sample purchase per kind (confirmation stories and `gift-card-bought:<kind>` deep links). */
export const SAMPLE_PURCHASES: Record<PurchaseKind, GiftPurchase> = {
    gift: purchaseFrom(SAMPLE_GIFT_ORDER),
    print: purchaseFrom(SAMPLE_PRINT_ORDER),
    me: purchaseFrom(SAMPLE_SELF_ORDER),
};

/** "Your $60 gift card is in your wallet" / "Your gift to Alex Rivera is on its way". */
export const purchaseNotice = (p: GiftPurchase) =>
    p.kind === "me"
        ? { title: `Your ${moneyWhole(orderValue(p.order))} gift card is in your wallet`, body: "Use it at checkout or at the Pro Shop counter." }
        : { title: `Your gift to ${toName(p.order)} is on its way`, body: "You'll find it under Sent as gifts." };

const moneyWhole = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

interface GiftCardsState {
    cards: WalletGiftCard[];
    sent: WalletSentGift[];
    lastPurchase: GiftPurchase | null;
    /** The success notice on Gift Cards, until it's closed. */
    noticeOpen: boolean;
}

export interface GiftCardsApi extends GiftCardsState {
    /** Records a paid order: a New card in the wallet, or a New row under Sent as gifts. */
    pay: (order: GiftCardOrder, paidWith: PaymentCard) => GiftPurchase;
    closeNotice: () => void;
}

const initialState = (): GiftCardsState => ({ cards: WALLET_GIFT_CARDS, sent: SENT_GIFTS, lastPurchase: null, noticeOpen: false });

type Store = { get: () => GiftCardsState; set: (fn: (s: GiftCardsState) => GiftCardsState) => void; subscribe: (l: () => void) => () => void };

const createStore = (initial: GiftCardsState): Store => {
    let state = initial;
    const listeners = new Set<() => void>();
    return {
        get: () => state,
        set: (fn) => {
            state = fn(state);
            listeners.forEach((l) => l());
        },
        subscribe: (l) => {
            listeners.add(l);
            return () => listeners.delete(l);
        },
    };
};

/** Without a provider (single-screen stories, Global Nav) every screen shares this one. */
const sharedStore = createStore(initialState());

const GiftCardsContext = createContext<Store | null>(null);

/**
 * GiftCardsProvider — the prototype's gift cards: paying in the builder adds a New card to the
 * wallet or a New row to Sent as gifts. Each provider starts from the sample wallet, so the
 * prototype's Reset and each Flow story begin clean.
 */
export const GiftCardsProvider = ({ children }: { children: ReactNode }) => {
    const [store] = useState(() => createStore(initialState()));
    return <GiftCardsContext.Provider value={store}>{children}</GiftCardsContext.Provider>;
};

export const useGiftCards = (): GiftCardsApi => {
    const store = useContext(GiftCardsContext) ?? sharedStore;
    const state = useSyncExternalStore(store.subscribe, store.get, store.get);
    return useMemo<GiftCardsApi>(
        () => ({
            ...state,
            pay: (order, paidWith) => {
                const s = store.get();
                const n = s.cards.filter((c) => c.id.startsWith(NEW_CARD_ID)).length + s.sent.filter((g) => g.id.startsWith(NEW_SENT_ID)).length;
                const suffix = n === 0 ? "" : `-${n + 1}`;
                const purchase = purchaseFrom(order, paidWith, {
                    cardId: `${NEW_CARD_ID}${suffix}`,
                    sentId: `${NEW_SENT_ID}${suffix}`,
                    code: n === 0 ? SAMPLE_GIFT_CARD_ID : newGiftCardId(),
                });
                store.set((prev) => ({
                    ...prev,
                    cards: purchase.cardId ? [walletCardFrom(order, purchase.cardId, purchase.code), ...prev.cards] : prev.cards,
                    sent: purchase.sentId ? [walletSentFrom(order, purchase.sentId), ...prev.sent] : prev.sent,
                    lastPurchase: purchase,
                    noticeOpen: true,
                }));
                return purchase;
            },
            closeNotice: () => store.set((prev) => ({ ...prev, noticeOpen: false })),
        }),
        [state, store],
    );
};
