/**
 * Crane Web shop data — the Pro Shop catalog (store-catalog.ts, from Fox) organised the way
 * CraneWeb routes it: groups → subgroups → products, every level deep-linkable
 * (/shop/golf-balls/dozens), plus Club Offerings and a few snack-bar items so the
 * "food & shop items check out separately" rule can be shown.
 */
import { POS_PRODUCTS, POS_SUBGROUP_LABELS } from "./shop-pos-catalog";
import { STORE_PRODUCTS, type StoreProduct } from "./store-catalog";

export type ProductKind = "retail" | "food";

export interface ShopProduct extends StoreProduct {
    group: string;
    subgroup: string;
    kind: ProductKind;
    /** Units on hand (CraneWeb shows "In Stock: 93"). 0 when out of stock. */
    stock: number;
}

export interface ShopSubgroup {
    slug: string;
    label: string;
}

export interface ShopGroup {
    slug: string;
    label: string;
    subgroups: ShopSubgroup[];
}

/** Group order + labels. Subgroups are derived from the products (see SHOP_GROUPS below). */
const GROUP_META: { slug: string; label: string }[] = [
    { slug: "apparel", label: "Apparel" },
    { slug: "shoes", label: "Shoes" },
    { slug: "golf-balls", label: "Golf Balls" },
    { slug: "accessories", label: "Accessories" },
    { slug: "snack-bar", label: "Snack Bar" },
];

const SUBGROUP_LABELS: Record<string, string> = { ...POS_SUBGROUP_LABELS, specialty: "Specialty & Limited", training: "Training", mens: "Men's", womens: "Women's" };

export const groupBySlug = (slug: string) => SHOP_GROUPS.find((g) => g.slug === slug);

const hash = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

const place = (p: StoreProduct): Pick<ShopProduct, "group" | "subgroup"> => {
    if (p.category === "apparel") return { group: "apparel", subgroup: p.subcategory };
    if (p.category === "shoes") return { group: "shoes", subgroup: /women/i.test(p.title) ? "womens" : "mens" };
    // Fox's ball set is special editions (USA 250, Georgia Tech, Mother's Day…), not stock dozens.
    if (p.subcategory === "golf-balls") return { group: "golf-balls", subgroup: "specialty" };
    return { group: "accessories", subgroup: "training" };
};

/** Retail catalog (105 products, real Pro Shop imagery). */
const RETAIL: ShopProduct[] = STORE_PRODUCTS.map((p) => ({
    ...p,
    ...place(p),
    kind: "retail",
    stock: p.inStock ? 3 + (hash(p.id) % 140) : 0,
}));

/**
 * Full catalog: Fox's Pro Shop apparel/shoes/balls + the curated POS catalog (golf balls,
 * accessories, snack-bar food & drink — images from references/111226).
 */
export const SHOP_PRODUCTS: ShopProduct[] = [...RETAIL, ...POS_PRODUCTS];

/** Groups → subgroups, in GROUP_META order; only subgroups that have products appear. */
export const SHOP_GROUPS: ShopGroup[] = GROUP_META.map((g) => {
    const subs = [...new Set(SHOP_PRODUCTS.filter((p) => p.group === g.slug && p.subgroup).map((p) => p.subgroup))];
    const order = ["mens", "womens", "dozens", "sleeves", "specialty", "range", "other", ...Object.keys(SUBGROUP_LABELS)];
    subs.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)));
    return { ...g, subgroups: subs.map((slug) => ({ slug, label: SUBGROUP_LABELS[slug] ?? slug })) };
});

export const productById = (id: string) => SHOP_PRODUCTS.find((p) => p.id === id);

export const productsIn = (group?: string, subgroup?: string) =>
    SHOP_PRODUCTS.filter((p) => (!group || p.group === group) && (!subgroup || p.subgroup === subgroup));

/** Hand-picked, in-stock, mixed categories — the "Featured" row on Shop. */
const dedupe = (list: ShopProduct[]) => list.filter((p, i) => list.findIndex((q) => q.id === p.id) === i);
const byId = (ids: string[]) => ids.flatMap((id) => SHOP_PRODUCTS.filter((p) => p.id === id));
export const FEATURED: ShopProduct[] = dedupe([
    ...byId(["ball-titleist-pro-v1-dozen", "ball-taylormade-tp5-dozen"]),
    ...productsIn("apparel", "mens").filter((p) => p.inStock).slice(0, 2),
    ...productsIn("shoes").filter((p) => p.inStock).slice(0, 1),
    ...productsIn("golf-balls", "dozens").filter((p) => p.inStock).slice(0, 2),
    ...productsIn("apparel", "womens").filter((p) => p.inStock).slice(0, 1),
    ...productsIn("accessories").filter((p) => p.inStock).slice(0, 2),
]);

export const priceOf = (p: StoreProduct) => (p.onSale && p.salePrice ? p.salePrice : p.price);

/* ---------- Club Offerings (gift cards, punch cards, memberships sold in the shop) ---------- */

export interface ClubOffering {
    id: string;
    kind: "gift-card" | "punch-card" | "membership";
    eyebrow: string;
    title: string;
    description?: string;
    /** "From $25" style label, or a fixed price. */
    priceLabel: string;
    cta: string;
}

export const CLUB_OFFERINGS: ClubOffering[] = [
    { id: "o-gift", kind: "gift-card", eyebrow: "Gift Cards", title: "Give the gift of golf", description: "Good for tee times, lessons and the pro shop.", priceLabel: "From $25", cta: "Purchase" },
    { id: "o-punch", kind: "punch-card", eyebrow: "Punch Cards", title: "20-Round Green Fee Card", description: "Prepay 20 rounds, use them any day this season.", priceLabel: "$1,040.00", cta: "Purchase" },
    { id: "o-weekday", kind: "membership", eyebrow: "Membership", title: "Weekday Membership", priceLabel: "$1,450.00 / yr", cta: "Join" },
    { id: "o-monthly", kind: "membership", eyebrow: "Membership", title: "Monthly Membership", priceLabel: "$500.00 / mo", cta: "Join" },
];

/* ---------- Deep links ---------- */

/** CraneWeb paths, shown in the WebFrame address bar so the routing is visible in reviews. */
export const shopPath = (group?: string, subgroup?: string) => ["/shop", group, subgroup].filter(Boolean).join("/");
export const productPath = (p: ShopProduct) => `/shop/${p.group}${p.subgroup ? `/${p.subgroup}` : ""}/${p.id}`;

/* ---------- Destination tax (illustrative rates) ---------- */

export interface TaxJurisdiction {
    zip: string;
    /** "Athens-Clarke County, GA" */
    label: string;
    /** Combined state + county + city rate. */
    rate: number;
}

/**
 * Sample destination rates so checkout can show tax changing with the ship-to address.
 * Real rates come from a tax service at checkout — these are for the prototype only.
 */
export const TAX_BY_ZIP: Record<string, TaxJurisdiction> = {
    "01940": { zip: "01940", label: "Lynnfield, Essex County, MA", rate: 0.0625 },
    "02445": { zip: "02445", label: "Brookline, Norfolk County, MA", rate: 0.0625 },
    "30602": { zip: "30602", label: "Athens-Clarke County, GA", rate: 0.08 },
    "30303": { zip: "30303", label: "Atlanta, Fulton County, GA", rate: 0.089 },
    "03862": { zip: "03862", label: "North Hampton, NH", rate: 0 },
    "10001": { zip: "10001", label: "New York, NY", rate: 0.08875 },
};

/** Pick-up orders are taxed where the course is. */
export const COURSE_TAX = TAX_BY_ZIP["01940"];

export const taxFor = (zip: string | undefined): TaxJurisdiction | null => (zip ? (TAX_BY_ZIP[zip] ?? null) : null);

export const FREE_SHIPPING_THRESHOLD = 500;
export const GROUND_SHIPPING = 19.9;
