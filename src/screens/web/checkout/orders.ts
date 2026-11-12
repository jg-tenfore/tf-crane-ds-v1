/**
 * Placed orders for the prototype. Place order stores the order here, clears the cart and
 * navigates to /order/<id>; ConfirmationPage reads it back. Unknown ids (static stories,
 * deep links) fall back to fixtures so the page always renders.
 */
import { linesFrom, type CartLine } from "../cart-store";
import {
    computeTotals,
    FOOD_CART,
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
    kind: "retail" | "food";
    fulfillment: Fulfillment;
    address: Address | null;
    payment: SavedPayment;
    plan: Plan;
    totals: Totals;
    promo: string | null;
}

const ORDERS = new Map<string, PlacedOrder>();
let seq = 100482;

export const placeOrder = (o: Omit<PlacedOrder, "id">): string => {
    const id = `SG-${++seq}`;
    ORDERS.set(id, { ...o, id });
    return id;
};

/** Fixture orders for stories: SG-100482 shipped (GA), SG-100483 pro-shop pickup, SG-100484 snack-bar pickup. */
const fixture = (id: string): PlacedOrder => {
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
