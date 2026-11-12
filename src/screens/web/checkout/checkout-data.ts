/**
 * Checkout fixtures + money maths for Crane Web's cart → checkout → confirmation flow.
 * Ported from Fox "Shop Checkout" (cart-shared.tsx / cart-checkout.stories.tsx) and extended
 * with destination tax (state + county + city), pickup, fees and surcharge from live CraneWeb.
 */
import { COURSE_TAX, FREE_SHIPPING_THRESHOLD, GROUND_SHIPPING, productById, SHOP_PRODUCTS, TAX_BY_ZIP, taxFor, type ShopProduct, type TaxJurisdiction } from "@/data/shop";
import type { CartLine } from "../cart-store";

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
export const pct = (rate: number) => `${(rate * 100).toFixed(2)}%`;
export const itemsLabel = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/* ---------- Fixture products (queried, never hard-coded — the catalog keeps growing) ---------- */

const firstInStock = (pred: (p: ShopProduct) => boolean) => SHOP_PRODUCTS.find((p) => p.inStock && pred(p));

/** Fox's three-line cart: a polo, a pair of shoes, two dozen balls. */
export const FIXTURE = {
    apparel: firstInStock((p) => p.group === "apparel"),
    shoes: firstInStock((p) => p.group === "shoes"),
    balls: productById("ball-titleist-pro-v1-dozen") ?? firstInStock((p) => p.group === "golf-balls" && p.subgroup === "dozens") ?? firstInStock((p) => p.group === "golf-balls"),
    accessory: firstInStock((p) => p.group === "accessories"),
    /** A burger, a side and a drink when the catalog has them, then the rest of the snack bar. */
    food: (() => {
        const all = SHOP_PRODUCTS.filter((p) => p.kind === "food" && p.inStock);
        const picks = ["burgers-and-dogs", "sides", "non-alcoholic", "beer"].flatMap((sg) => all.filter((p) => p.subgroup === sg).slice(0, 1));
        return [...picks, ...all.filter((p) => !picks.includes(p))];
    })(),
};

type Fixture = [id: string, variant: string, qty: number];
const fx = (p: ShopProduct | undefined, variant: string, qty: number): Fixture[] => (p ? [[p.id, variant, qty]] : []);

/** `linesFrom()` input for the default 3-item retail cart. */
export const RETAIL_CART: Fixture[] = [...fx(FIXTURE.apparel, "White · L", 1), ...fx(FIXTURE.shoes, "Size 10.5", 1), ...fx(FIXTURE.balls, "", 2)];

/** A snack-bar order (pickup only). */
export const FOOD_CART: Fixture[] = FIXTURE.food.slice(0, 3).map((p, i) => [p.id, "", i === 0 ? 2 : 1]);

/** Pro shop + snack bar in one cart — what live CraneWeb refuses to check out together. */
export const MIXED_CART: Fixture[] = [...RETAIL_CART.slice(0, 2), ...FOOD_CART.slice(0, 2)];

/** Over the free-shipping threshold. */
export const BIG_CART: Fixture[] = [...fx(FIXTURE.apparel, "White · L", 2), ...fx(FIXTURE.shoes, "Size 10.5", 1), ...fx(FIXTURE.balls, "", 4)];

/** Recommendations for "Add more" — in stock, retail, not already in the cart. */
export const recommendationsFor = (lines: CartLine[], n = 6) => {
    const inCart = new Set(lines.map((l) => l.product.id));
    const kind = lines[0]?.product.kind ?? "retail";
    const pool = SHOP_PRODUCTS.filter((p) => p.kind === kind && p.inStock && !inCart.has(p.id));
    // Round-robin across groups/subgroups so the grid isn't six polos.
    const keys = [...new Set(pool.map((p) => (kind === "food" ? p.subgroup : p.group)))];
    const pools = keys.map((k) => pool.filter((p) => (kind === "food" ? p.subgroup : p.group) === k));
    const out: ShopProduct[] = [];
    for (let i = 0; out.length < n && i < 80; i++) {
        const p = pools[i % pools.length][Math.floor(i / pools.length)];
        if (p) out.push(p);
    }
    return out;
};

/* ---------- Addresses ---------- */

export interface Address {
    id: string;
    name: string;
    /** Optional company / attention line. */
    company?: string;
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    isDefault?: boolean;
}

export const addressLine = (a: Address) => `${a.street}${a.apt ? `, ${a.apt}` : ""}, ${a.city}, ${a.state} ${a.zip}`;

/** Two saved addresses in different tax jurisdictions so reviewers can flip and watch tax change. */
export const SAVED_ADDRESSES: Address[] = [
    { id: "addr-ma", name: "Justin Girard", street: "118 Fairway Dr", city: "Brookline", state: "MA", zip: "02445", phone: "(617) 555-0142", isDefault: true },
    { id: "addr-ga", name: "Justin Girard", company: "UGA Men's Golf", street: "100 Sanford Dr", city: "Athens", state: "GA", zip: "30602", phone: "(706) 555-0190" },
];

/** Fake type-ahead results for the Add address modal. */
export const ADDRESS_SUGGESTIONS: Omit<Address, "id" | "name">[] = [
    { street: "1 Lumpkin St", city: "Athens", state: "GA", zip: "30602" },
    { street: "10 Lumpkin Rd", city: "Atlanta", state: "GA", zip: "30303" },
    { street: "1 Lumpkin Ave", city: "Somerville", state: "MA", zip: "02145" },
];

export const US_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

/* ---------- Tax ---------- */

export interface TaxQuote {
    /** Row label: "Tax · Athens-Clarke County, GA (8.00%)". */
    label: string;
    rate: number;
    /** True when the ZIP isn't in our table — we show an estimate and confirm later. */
    estimated: boolean;
    jurisdiction?: TaxJurisdiction;
}

/** Fallback when we only know the state — a known rate in that state, else a conservative 7%. */
const stateRate = (state: string) => Object.values(TAX_BY_ZIP).find((j) => j.label.endsWith(`, ${state}`))?.rate ?? 0.07;

export const quoteTax = (fulfillment: Fulfillment, address: Address | null): TaxQuote | null => {
    if (fulfillment === "pickup") return { label: `Tax · ${COURSE_TAX.label} (${pct(COURSE_TAX.rate)})`, rate: COURSE_TAX.rate, estimated: false, jurisdiction: COURSE_TAX };
    if (!address) return null;
    const j = taxFor(address.zip);
    if (j) return { label: `Tax · ${j.label} (${pct(j.rate)})`, rate: j.rate, estimated: false, jurisdiction: j };
    const rate = stateRate(address.state);
    return { label: `Est. tax · ${address.city}, ${address.state} (${pct(rate)})`, rate, estimated: true };
};

/* ---------- Fees, rewards, promo ---------- */

/** Course service fee on merchandise (live CraneWeb shows "Fees"). */
export const FEE_RATE = 0.03;
/** Credit-card surcharge (live CraneWeb shows "Surcharge"). */
export const SURCHARGE_RATE = 0.0335;

export const REWARDS = { points: 415, expiringPoints: 38, expiringInDays: 10, cost: 200, value: 20 };

/** Any code works in the prototype; gift cards (GC-…) take $25, promo codes $20. */
export const promoValue = (code: string) => (code.toUpperCase().startsWith("GC") ? 25 : 20);
export const DEMO_PROMO = "FALL20";

/* ---------- Totals ---------- */

export type Fulfillment = "ship" | "pickup";
export type Plan = "now" | "installments";

export interface Totals {
    count: number;
    subtotal: number;
    promoDiscount: number;
    rewardDiscount: number;
    discount: number;
    /** null = not applicable (pickup). */
    shipping: number | null;
    freeShipping: boolean;
    /** null = not known yet ("Calculated after address"). */
    tax: number | null;
    taxQuote: TaxQuote | null;
    fees: number;
    surcharge: number;
    total: number;
}

export const computeTotals = ({
    lines,
    fulfillment,
    address,
    promo,
    rewardApplied,
    shippingKnown = true,
}: {
    lines: CartLine[];
    fulfillment: Fulfillment;
    address: Address | null;
    promo?: string | null;
    rewardApplied?: boolean;
    /** On the cart we don't know ship vs pickup yet. */
    shippingKnown?: boolean;
}): Totals => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + (l.product.onSale && l.product.salePrice ? l.product.salePrice : l.product.price) * l.qty, 0);
    const promoDiscount = promo ? Math.min(promoValue(promo), subtotal) : 0;
    const rewardDiscount = rewardApplied ? Math.min(REWARDS.value, subtotal - promoDiscount) : 0;
    const discount = promoDiscount + rewardDiscount;
    const merch = Math.max(0, subtotal - discount);
    const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = fulfillment === "pickup" || count === 0 ? null : freeShipping ? 0 : shippingKnown ? GROUND_SHIPPING : null;
    const taxQuote = quoteTax(fulfillment, address);
    const tax = taxQuote ? round(merch * taxQuote.rate) : null;
    const fees = round(merch * FEE_RATE);
    const surcharge = round(merch * SURCHARGE_RATE);
    const total = round(merch + (shipping ?? 0) + (tax ?? 0) + fees + surcharge);
    return { count, subtotal, promoDiscount, rewardDiscount, discount, shipping, freeShipping, tax, taxQuote, fees, surcharge, total };
};

const round = (n: number) => Math.round(n * 100) / 100;

/* ---------- Payment ---------- */

export type CardBrand = "Visa" | "Mastercard" | "Amex" | "PayPal";

export interface SavedPayment {
    id: string;
    brand: CardBrand;
    name: string;
    last4?: string;
    /** Set when expired — row is muted with a Delete action. */
    expired?: string;
}

export const SAVED_PAYMENTS: SavedPayment[] = [
    { id: "pm-amex", brand: "Amex", name: "American Express", last4: "3005" },
    { id: "pm-visa", brand: "Visa", name: "Visa", last4: "2521" },
    { id: "pm-mc", brand: "Mastercard", name: "Mastercard", last4: "6642" },
    { id: "pm-barclays", brand: "Mastercard", name: "Barclays", last4: "1180", expired: "05/2026" },
];

export const paymentLabel = (p: SavedPayment) => (p.last4 ? `${p.name} ···· ${p.last4}` : p.name);

/* ---------- Pickup ---------- */

export const PICKUP = {
    retail: { place: "Pro Shop", ready: "Ready in 1–2 days", hours: "Open daily 6:30 AM – 7:00 PM" },
    food: { place: "Snack Bar", ready: "Ready in about 15 minutes", hours: "Grill open 7:00 AM – 5:00 PM" },
};

/** Fixed "today" for deterministic stories (Nov 12, 2026). */
export const ORDER_DATE = "November 12, 2026";
export const ARRIVAL = "Nov 18–21";
