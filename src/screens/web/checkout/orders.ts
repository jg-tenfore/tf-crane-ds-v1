/**
 * Placed orders for the prototype. Place order stores the order here, clears the cart and
 * navigates to /order/<id>; ConfirmationPage reads it back. Unknown ids (static stories,
 * deep links) fall back to fixtures so the page always renders.
 */
import { SAMPLE_GIFT_CARD_ID } from "@/data/gift-cards";
import type { ProductKind } from "@/data/shop";
import { upcCheckDigit } from "@/components/gift-cards/upc-barcode";
import { linesFrom, type CartLine } from "../cart-store";
import {
    computeGiftTotals,
    computeTotals,
    FOOD_CART,
    GIFT_EMAIL_ORDER,
    GIFT_PRINT_ORDER,
    GIFT_SELF_ORDER,
    giftLine,
    RETAIL_CART,
    SAVED_ADDRESSES,
    SAVED_PAYMENTS,
    type Address,
    type Fulfillment,
    type Plan,
    type SavedPayment,
    type Totals,
} from "./checkout-data";

export interface PlacedOrder {
    id: string;
    lines: CartLine[];
    /** Each kind checks out on its own; "gift-card" orders have no address, shipping or tax. */
    kind: ProductKind;
    /** "email": gift cards, emailed or saved to the wallet (no address). */
    fulfillment: Fulfillment | "email";
    address: Address | null;
    payment: SavedPayment;
    plan: Plan;
    totals: Totals;
    promo: string | null;
}

const ORDERS = new Map<string, PlacedOrder>();
let seq = 100482;
/** Gift card orders number on from the gift fixtures (SG-100519…21), so a placed one never replaces them. */
let giftSeq = 100521;

export const placeOrder = (o: Omit<PlacedOrder, "id">): string => {
    const id = `SG-${o.kind === "gift-card" ? ++giftSeq : ++seq}`;
    ORDERS.set(id, { ...o, id });
    return id;
};

/** The gift fixtures: SG-100519 a gift by email, SG-100520 a gift to print, SG-100521 a card for yourself. */
export const GIFT_ORDER_IDS = { email: "SG-100519", print: "SG-100520", self: "SG-100521" } as const;

const giftFixture = (id: string): PlacedOrder | null => {
    const order = id === GIFT_ORDER_IDS.email ? GIFT_EMAIL_ORDER : id === GIFT_ORDER_IDS.print ? GIFT_PRINT_ORDER : id === GIFT_ORDER_IDS.self ? GIFT_SELF_ORDER : null;
    if (!order) return null;
    const lines = [giftLine(order, `gift-card-${id.toLowerCase()}`)];
    return { id, lines, kind: "gift-card", fulfillment: "email", address: null, payment: SAVED_PAYMENTS[0], plan: "now", promo: null, totals: computeGiftTotals(lines) };
};

/** Fixture orders for stories: SG-100482 shipped (GA), SG-100483 pro-shop pickup, SG-100484 snack-bar pickup, plus the gift fixtures above. */
const fixture = (id: string): PlacedOrder => {
    const gift = giftFixture(id);
    if (gift) return gift;
    if (id === "SG-100484") {
        const lines = linesFrom(FOOD_CART);
        return { id, lines, kind: "food", fulfillment: "pickup", address: null, payment: SAVED_PAYMENTS[1], plan: "now", promo: null, totals: computeTotals({ lines, fulfillment: "pickup", address: null }) };
    }
    const lines = linesFrom(RETAIL_CART);
    if (id === "SG-100483") {
        return { id, lines, kind: "retail", fulfillment: "pickup", address: null, payment: SAVED_PAYMENTS[0], plan: "now", promo: null, totals: computeTotals({ lines, fulfillment: "pickup", address: null }) };
    }
    const address = SAVED_ADDRESSES[1];
    return { id, lines, kind: "retail", fulfillment: "ship", address, payment: SAVED_PAYMENTS[0], plan: "now", promo: null, totals: computeTotals({ lines, fulfillment: "ship", address }) };
};

export const orderById = (id: string): PlacedOrder => ORDERS.get(id) ?? fixture(id);

/**
 * The 12-digit Gift Card ID of an order's nth gift card. The first is the sample id
 * (284716093352); further cards count on from it with a fresh UPC-A check digit.
 */
export const giftCardIdAt = (index: number) => {
    if (index === 0) return SAMPLE_GIFT_CARD_ID;
    const base = String(Number(SAMPLE_GIFT_CARD_ID.slice(0, 11)) + index).padStart(11, "0");
    return base + upcCheckDigit(base);
};
