/**
 * Gift cards: the Nov 25 "New Concept" flow from Fox (Reviews › Nov 25 – Gift Cards, Fox PRs #23–#25),
 * brought to Crane Web, Crane Web checkout and the iPhone app. Spec:
 * tf-fox-ds-v1/docs/handoffs/2026-11-25-gift-cards-for-crane.md.
 *
 * One builder page in three steps (amount with deals first, design, who it's for), then the shop's own
 * cart → checkout → confirmation. Decisions for Crane (Justin, Nov 25):
 * - A gift card checks out on its own, like food: its own cart kind ("gift-card"), never mixed with pro
 *   shop items, so there's no Ship to, shipping or tax on a gift order.
 * - Sent today only (no scheduled date).
 * - With email delivery, the optional recipient phone also gets a text with the card.
 * - Anyone can build a card; checkout uses Crane's sign-in step. Signed out, the From box asks for a
 *   name and email.
 * - The three deals and the $10–$500 custom range are sample rules.
 *
 * Sample people only: the buyer is Crane's signed-in sample golfer (USER); the recipient is made up.
 */
import autumnRound from "@/components/gift-cards/art/autumn-round.webp";
import birthdayGift from "@/components/gift-cards/art/birthday-gift.webp";
import celebrationFireworks from "@/components/gift-cards/art/celebration-fireworks.webp";
import clubhouseLights from "@/components/gift-cards/art/clubhouse-lights.webp";
import coastalCliffs from "@/components/gift-cards/art/coastal-cliffs.webp";
import desertCanyon from "@/components/gift-cards/art/desert-canyon.webp";
import holidaySnow from "@/components/gift-cards/art/holiday-snow.webp";
import mountainValley from "@/components/gift-cards/art/mountain-valley.webp";
import onTheGreen from "@/components/gift-cards/art/on-the-green.webp";
import sunriseFairway from "@/components/gift-cards/art/sunrise-fairway.webp";
import { TODAY, USER } from "./crane";
import type { ShopProduct } from "./shop";

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

/** What every card can be spent on, as the live shop words it. */
export const GOOD_FOR = "golf, food & drink, alcohol and merchandise";

export type DesignTheme = "classic" | "destinations" | "occasions";

export interface CardDesign {
    id: string;
    name: string;
    /** Image URL (Vite asset, 960 × 640). */
    art: string;
    theme: DesignTheme;
}

/** The groups in "Pick a design", in order. */
export const DESIGN_THEMES: { id: DesignTheme; label: string }[] = [
    { id: "classic", label: "Classic" },
    { id: "destinations", label: "Destinations" },
    { id: "occasions", label: "Holidays & occasions" },
];

export const CARD_DESIGNS: CardDesign[] = [
    { id: "sunrise-fairway", name: "Sunrise fairway", art: sunriseFairway, theme: "classic" },
    { id: "on-the-green", name: "On the green", art: onTheGreen, theme: "classic" },
    { id: "clubhouse-lights", name: "Clubhouse lights", art: clubhouseLights, theme: "classic" },
    { id: "autumn-round", name: "Autumn round", art: autumnRound, theme: "classic" },
    { id: "desert-canyon", name: "Desert canyon", art: desertCanyon, theme: "destinations" },
    { id: "coastal-cliffs", name: "Coastal cliffs", art: coastalCliffs, theme: "destinations" },
    { id: "mountain-lake", name: "Mountain lake", art: mountainValley, theme: "destinations" },
    { id: "snowy-holiday", name: "Snowy holiday", art: holidaySnow, theme: "occasions" },
    { id: "birthday-gift", name: "Birthday gift", art: birthdayGift, theme: "occasions" },
    { id: "fireworks-night", name: "Fireworks night", art: celebrationFireworks, theme: "occasions" },
];

export const DEFAULT_DESIGN_ID = "sunrise-fairway";
export const designById = (id: string | undefined): CardDesign => CARD_DESIGNS.find((d) => d.id === id) ?? CARD_DESIGNS[0];

export interface GiftCardDeal {
    id: string;
    /** What the golfer pays. */
    price: number;
    /** What the card is worth. */
    value: number;
    /** Last day it can be bought, YYYY-MM-DD. */
    endsOn?: string;
    limitPerCustomer?: number;
    soldOut?: boolean;
    /** Not on the live site: added to show more than one deal. */
    sample?: boolean;
}

/** $50 → $60 and the sold-out $100 → $120 match the live shop; $200 → $250 is a sample (all kept, Nov 25). */
export const GIFT_CARD_DEALS: GiftCardDeal[] = [
    { id: "deal-60-for-50", price: 50, value: 60 },
    { id: "deal-250-for-200", price: 200, value: 250, endsOn: "2026-12-31", limitPerCustomer: 2, sample: true },
    { id: "deal-120-for-100", price: 100, value: 120, endsOn: "2026-11-30", limitPerCustomer: 2, soldOut: true },
];
export const dealById = (id: string | undefined) => GIFT_CARD_DEALS.find((d) => d.id === id);
export const liveDeals = () => GIFT_CARD_DEALS.filter((d) => !d.soldOut);

export const STANDARD_AMOUNTS = [25, 50, 100, 200];

/** Custom amounts: a sample rule to review. */
export const CUSTOM_MIN = 10;
export const CUSTOM_MAX = 500;

export const MESSAGE_MAX = 300;

/* ------------------------------------------------------------------ */
/* The order                                                           */
/* ------------------------------------------------------------------ */

export type GiftRecipient = "someone" | "me";
export type GiftDelivery = "email" | "print";

/**
 * How the amount was chosen: a deal id, one of STANDARD_AMOUNTS as a string ("50"), or "custom"
 * (then `customAmount` holds what was typed).
 */
export type AmountChoice = string;

/** Everything the builder collects. `value` and `price` are derived (see orderValue / orderPrice). */
export interface GiftCardOrder {
    amount: AmountChoice;
    /** Raw text of the "Other amount" input. */
    customAmount: string;
    designId: string;
    recipient: GiftRecipient;
    delivery: GiftDelivery;
    toFirstName: string;
    toLastName: string;
    toEmail: string;
    toEmailConfirm: string;
    /** Only with email delivery; also gets a text with the card. */
    toPhone: string;
    toPhoneConfirm: string;
    message: string;
    fromName: string;
    fromEmail: string;
}

/** The signed-in sample golfer, as the From line shows them. */
export const BUYER = { name: `${USER.firstName} ${USER.lastName}`, firstName: USER.firstName, email: USER.email };

/** The sample recipient (made up; 555 number). */
export const SAMPLE_RECIPIENT = { firstName: "Alex", lastName: "Rivera", email: "alex.rivera@tenfore.golf", phone: "(617) 555-0186" };

/** A blank order: the first live deal, the default design, for someone else by email, from the buyer. */
export const newGiftCardOrder = (signedIn = true): GiftCardOrder => ({
    amount: liveDeals()[0]?.id ?? String(STANDARD_AMOUNTS[1]),
    customAmount: "",
    designId: DEFAULT_DESIGN_ID,
    recipient: "someone",
    delivery: "email",
    toFirstName: "",
    toLastName: "",
    toEmail: "",
    toEmailConfirm: "",
    toPhone: "",
    toPhoneConfirm: "",
    message: "",
    fromName: signedIn ? BUYER.name : "",
    fromEmail: signedIn ? BUYER.email : "",
});

/** A filled-in sample order (stories and the prototype's "filled in" state). */
export const SAMPLE_GIFT_ORDER: GiftCardOrder = {
    ...newGiftCardOrder(),
    designId: "birthday-gift",
    toFirstName: SAMPLE_RECIPIENT.firstName,
    toLastName: SAMPLE_RECIPIENT.lastName,
    toEmail: SAMPLE_RECIPIENT.email,
    toEmailConfirm: SAMPLE_RECIPIENT.email,
    message: "Happy birthday! First round's on me.",
};

/** The same order for yourself. */
export const SAMPLE_SELF_ORDER: GiftCardOrder = { ...newGiftCardOrder(), designId: "on-the-green", recipient: "me" };

const roundCents = (n: number) => Math.round(n * 100) / 100;

/** The typed custom amount as a number, or null when it isn't one. */
export const parseCustom = (raw: string): number | null => {
    const n = Number(raw.replace(/[$,\s]/g, ""));
    return raw.trim() && Number.isFinite(n) ? roundCents(n) : null;
};

export const orderDeal = (o: GiftCardOrder) => dealById(o.amount);

/** What the card is worth (0 while the custom amount is empty or invalid). */
export const orderValue = (o: GiftCardOrder): number => {
    const deal = orderDeal(o);
    if (deal) return deal.value;
    if (o.amount === "custom") return parseCustom(o.customAmount) ?? 0;
    return Number(o.amount) || 0;
};

/** What the golfer pays. */
export const orderPrice = (o: GiftCardOrder): number => orderDeal(o)?.price ?? orderValue(o);

export const orderBonus = (o: GiftCardOrder) => roundCents(orderValue(o) - orderPrice(o));

export const toName = (o: GiftCardOrder) => `${o.toFirstName.trim()} ${o.toLastName.trim()}`.trim();

/**
 * The deal that beats a standard amount for the same money ($50 → $60 when "$50" is picked), for
 * the "Same $50, bigger card" nudge. Undefined when there isn't one.
 */
export const betterDealFor = (o: GiftCardOrder): GiftCardDeal | undefined => {
    if (orderDeal(o) || o.amount === "custom") return undefined;
    const pay = Number(o.amount);
    return liveDeals().find((d) => d.price === pay && d.value > pay);
};

/** "To Alex Rivera · emailed today" / "To … · emailed to you to print" / "For you · saved to your wallet". */
export const deliveryLine = (o: GiftCardOrder) => {
    if (o.recipient === "me") return "For you · saved to your wallet";
    const who = toName(o) || "them";
    if (o.delivery === "print") return `To ${who} · emailed to you to print`;
    return `To ${who} · emailed today`;
};

/* ------------------------------------------------------------------ */
/* Validation (errors show only after Add to cart is pressed)          */
/* ------------------------------------------------------------------ */

export type GiftField = "customAmount" | "toFirstName" | "toLastName" | "toEmail" | "toEmailConfirm" | "toPhoneConfirm" | "fromName" | "fromEmail";
export type GiftErrors = Partial<Record<GiftField, string>>;

const digits = (s: string) => s.replace(/\D/g, "");
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export const validateGiftOrder = (o: GiftCardOrder): GiftErrors => {
    const e: GiftErrors = {};
    if (o.amount === "custom") {
        const n = parseCustom(o.customAmount);
        if (!o.customAmount.trim()) e.customAmount = "Enter an amount";
        else if (n === null || n < CUSTOM_MIN || n > CUSTOM_MAX) e.customAmount = `Enter an amount from $${CUSTOM_MIN} to $${CUSTOM_MAX}`;
    }
    if (o.recipient === "someone") {
        if (!o.toFirstName.trim()) e.toFirstName = "Add their first name";
        if (!o.toLastName.trim()) e.toLastName = "Add their last name";
        if (o.delivery === "email") {
            if (!looksLikeEmail(o.toEmail)) e.toEmail = "Add an email we can send the card to";
            else if (o.toEmail.trim().toLowerCase() !== o.toEmailConfirm.trim().toLowerCase()) e.toEmailConfirm = "The emails don't match";
            if ((o.toPhone.trim() || o.toPhoneConfirm.trim()) && digits(o.toPhone) !== digits(o.toPhoneConfirm)) e.toPhoneConfirm = "The phone numbers don't match";
        }
        if (!o.fromName.trim()) e.fromName = "Add who it's from";
        if (!looksLikeEmail(o.fromEmail)) e.fromEmail = "Add your email";
    } else if (!looksLikeEmail(o.fromEmail)) {
        // Signed out and buying for yourself: the card still needs an email to land on.
        e.fromEmail = "Add your email";
    }
    return e;
};

/** Field errors for the From panel, so it can open by itself when they're invalid. */
export const fromHasErrors = (e: GiftErrors) => !!(e.fromName || e.fromEmail);

/* ------------------------------------------------------------------ */
/* Deep links: the builder's state in the URL                          */
/* ------------------------------------------------------------------ */

/**
 * Query params for /shop/gift-cards. Short and readable for the common ones (`amount`, `design`,
 * `for`, `delivery`); the rest only when set, so Edit from the cart can restore everything.
 */
export const giftOrderToQuery = (o: GiftCardOrder, extra: Record<string, string | undefined> = {}): string => {
    const p = new URLSearchParams();
    const base = newGiftCardOrder(!!o.fromEmail && o.fromEmail === BUYER.email);
    const set = (k: string, v: string, dflt?: string) => {
        if (v && v !== dflt) p.set(k, v);
    };
    set("amount", o.amount);
    set("custom", o.amount === "custom" ? o.customAmount : "");
    set("design", o.designId);
    set("for", o.recipient);
    set("delivery", o.delivery, base.delivery);
    set("first", o.toFirstName);
    set("last", o.toLastName);
    set("email", o.toEmail);
    set("email2", o.toEmailConfirm);
    set("phone", o.toPhone);
    set("phone2", o.toPhoneConfirm);
    set("message", o.message);
    set("from", o.fromName, base.fromName);
    set("fromEmail", o.fromEmail, base.fromEmail);
    for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const q = p.toString();
    return q ? `?${q}` : "";
};

/** The builder's state from its query params (unknown or missing ones fall back to a new order). */
export const giftOrderFromQuery = (params: URLSearchParams, signedIn = true): GiftCardOrder => {
    const o = newGiftCardOrder(signedIn);
    const g = (k: string) => params.get(k) ?? undefined;
    const amount = g("amount");
    if (amount && (dealById(amount) || amount === "custom" || STANDARD_AMOUNTS.includes(Number(amount)))) o.amount = amount;
    if (o.amount === "custom") o.customAmount = g("custom") ?? "";
    if (g("design")) o.designId = designById(g("design")).id;
    if (g("for") === "me" || g("for") === "someone") o.recipient = g("for") as GiftRecipient;
    if (g("delivery") === "print" || g("delivery") === "email") o.delivery = g("delivery") as GiftDelivery;
    o.toFirstName = g("first") ?? "";
    o.toLastName = g("last") ?? "";
    o.toEmail = g("email") ?? "";
    o.toEmailConfirm = g("email2") ?? "";
    o.toPhone = g("phone") ?? "";
    o.toPhoneConfirm = g("phone2") ?? "";
    o.message = (g("message") ?? "").slice(0, MESSAGE_MAX);
    if (g("from")) o.fromName = g("from")!;
    if (g("fromEmail")) o.fromEmail = g("fromEmail")!;
    return o;
};

/** The builder's path with this order filled in. `edit` names the cart line Add to cart should replace. */
export const giftCardsHref = (o?: GiftCardOrder, edit?: string) => `/shop/gift-cards${o ? giftOrderToQuery(o, { edit }) : edit ? `?edit=${edit}` : ""}`;

/* ------------------------------------------------------------------ */
/* Cart: a gift card is its own cart kind                              */
/* ------------------------------------------------------------------ */

let nextLine = 1;

/**
 * The cart line's product for an order. Each card is its own line (id `gift-card-<n>`), priced at what
 * the golfer pays; the order rides along on `giftCard` so the cart, checkout and Edit can read it.
 * Pass `id` to replace an existing line (Edit from the cart), and `club` to name the course the golfer is on.
 */
export const giftCardProduct = (o: GiftCardOrder, id?: string, club: string = CLUB_SHORT): ShopProduct => ({
    id: id ?? `gift-card-${nextLine++}`,
    title: `${money0(orderValue(o))} ${club} gift card`,
    category: "equipment",
    subcategory: "gift-cards",
    src: designById(o.designId).art,
    price: orderPrice(o),
    onSale: false,
    rating: 5,
    reviews: 0,
    inStock: true,
    group: "gift-cards",
    subgroup: "",
    kind: "gift-card",
    stock: 999,
    giftCard: o,
});

/* ------------------------------------------------------------------ */
/* After purchase: codes, sample wallet history                        */
/* ------------------------------------------------------------------ */

/** The sample club name on the card face and in copy. */
export const CLUB_SHORT = "Sagamore Spring";
export const CLUB_NAME = "Sagamore Spring Golf Club";

/** The order number on every sample confirmation. */
export const GIFT_ORDER_NUMBER = "SG-100519";

/** A 12-digit Gift Card ID, as on the live shop (UPC-A: 11 digits + a check digit). */
export const SAMPLE_GIFT_CARD_ID = "284716093352";

/** "••••••••3352" for a gift (the buyer never sees the full code); the full id for yourself. */
export const maskCode = (code: string) => (/^\d{12}$/.test(code) ? `••••••••${code.slice(-4)}` : code);

/** "4716 0933 52" style grouping for reading a 12-digit id aloud: "2847 1609 3352". */
export const groupCode = (code: string) => code.replace(/(\d{4})(?=\d)/g, "$1 ");

export interface SentGift {
    id: string;
    date: Date;
    designId: string;
    value: number;
    paid: number;
    toName: string;
    toEmail: string;
    delivery: GiftDelivery;
}

/** Gifts the sample golfer sent earlier (Wallet › Gift cards › Sent as gifts). */
export const SENT_GIFTS: SentGift[] = [
    { id: "sg-1", date: new Date(2026, 8, 14), designId: "autumn-round", value: 100, paid: 100, toName: "Jordan Lee", toEmail: "jordan.lee@tenfore.golf", delivery: "email" },
];

/** The SentGift an order becomes once paid (today). */
export const sentGiftFrom = (o: GiftCardOrder, id = "sg-new"): SentGift => ({
    id,
    date: TODAY,
    designId: o.designId,
    value: orderValue(o),
    paid: orderPrice(o),
    toName: toName(o),
    toEmail: o.delivery === "email" ? o.toEmail.trim() : BUYER.email,
    delivery: o.delivery,
});

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const money = (n: number) => `$${n.toFixed(2)}`;
/** "$60" for whole dollars, "$62.50" otherwise. */
export const money0 = (n: number) => (Number.isInteger(n) ? `$${n}` : money(n));

/** "Dec 31" for a deal's YYYY-MM-DD end date. */
export const dealEnds = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** "Ends Dec 31 · Limit 2 each". */
export const dealTerms = (d: GiftCardDeal) => [d.endsOn ? `Ends ${dealEnds(d.endsOn)}` : null, d.limitPerCustomer ? `Limit ${d.limitPerCustomer} each` : null].filter(Boolean).join(" · ");
