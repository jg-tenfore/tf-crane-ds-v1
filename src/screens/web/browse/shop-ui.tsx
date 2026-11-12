import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { Check, ChevronDown, Heart, Image01, SearchLg, ShoppingBag01, Star01, XCircle } from "@untitledui/icons";
import { Button as AriaButton, Input as AriaInput, SearchField as AriaSearchField } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tag, type TagTone } from "@/components/base/badge";
import { Button, type ButtonProps } from "@/components/base/button";
import { WebLink } from "@/components/web/web-router";
import { priceOf, productPath, SHOP_PRODUCTS, type ShopProduct } from "@/data/shop";

/**
 * Shared Crane Web shop UI — ported from Fox's store-ui.tsx (money, StarRating, badgesFor,
 * logoFor, ProductCard) and its Shop All filter bar, restyled for CraneWeb: white cards with a
 * hairline ring, Outfit + the web type scale, Tag pills, no glass.
 */

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const hashId = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

export const isSoldOut = (p: ShopProduct) => !p.inStock || p.stock <= 0;

/* ------------------------------------------------------------------ */
/* Web-sized button                                                    */
/* ------------------------------------------------------------------ */



/**
 * The shared Button with web sizing (its built-in sizes use the iOS type scale). The
 * override classes win through tailwind-merge.
 */
export const WebButton = ({ size = "md", ...props }: Omit<ButtonProps, "size"> & { size?: "sm" | "md" | "lg" }) => <Button {...props} size={`web-${size}`} />;

/* ------------------------------------------------------------------ */
/* Brand logos (Fox logoFor)                                           */
/* ------------------------------------------------------------------ */

export interface BrandLogo {
    src: string;
    name: string;
}
const b = (file: string, name: string) => ({ file, name });

const LOGO_BUCKETS: Record<string, { file: string; name: string }[]> = {
    "apparel/mens": [
        b("OriginalPenguin_ELEVATED-MAINLINE-LOGO-ba042017d1.webp", "Original Penguin"),
        b("REDVANLY-LOGO-50345d4390.webp", "Redvanly"),
        b("ashworth-golfman-logo-01-065f4aac2a.webp", "Ashworth"),
        b("logo-JLindeberg_001-49e0d0d5de.webp", "J.Lindeberg"),
        b("logo-JohnnieO-70fe23ac65.webp", "Johnnie-O"),
        b("logo-Peter-Millar-8a36b6699a.webp", "Peter Millar"),
        b("logo-GFORE-94bda6d0d9.webp", "G/FORE"),
        b("logo-PGA-TOUR-Apparel-8c13ef62d0.webp", "PGA TOUR"),
        b("sundayred4-d1cec7cc08.webp", "Sunday Red"),
        b("fila_clipped_rev_1-1-3714ee1c86.webp", "FILA"),
        b("adidas_Logo-35ce49f60e.webp", "adidas"),
        b("logo-Nike-ca117a106f.webp", "Nike"),
        b("logo-PUMA-5a1f394b3b.webp", "PUMA"),
        b("GOATLANE-LOGO-BLACK-1f624e31e5.webp", "Goat Lane"),
    ],
    "apparel/womens": [
        b("LillyPulitzer_Logo-Secondary_Black-9795c24b0c.webp", "Lilly Pulitzer"),
        b("FPMovement_Logo-black-1-ea2cdedf4f.webp", "FP Movement"),
        b("beyondyoga_logo-c1499b2a01.webp", "Beyond Yoga"),
        b("varley-logo-8fe24fa55a.webp", "Varley"),
        b("lucky-in-love-logo-e625ed957d.webp", "Lucky in Love"),
        b("Logo_Final_Turtles_and_Tees_300x_clipped_rev_1-215cd41926.webp", "Turtles & Tees"),
        b("logo-PGA-TOUR-Apparel-dff1845b44.webp", "PGA TOUR"),
        b("adidas_Logo-395c24decd.webp", "adidas"),
        b("logo-Nike-eaba0e9255.webp", "Nike"),
        b("logo-PUMA-7d1990d67a.webp", "PUMA"),
    ],
    "shoes/golf-shoes": [
        b("24_FJ_Jewel_K_3-063a2db0f2.webp", "FootJoy"),
        b("adidas_Logo-cdf1b1e41c.webp", "adidas"),
        b("logo-Nike-ca117a106f.webp", "Nike"),
        b("logo-PUMA-5a1f394b3b.webp", "PUMA"),
        b("OluKai-94f241e7e3.webp", "OluKai"),
        b("Birkenstock1-a48b3b2aa6.webp", "Birkenstock"),
        b("logo-GFORE-94bda6d0d9.webp", "G/FORE"),
        b("sundayred4-d1cec7cc08.webp", "Sunday Red"),
    ],
    "equipment/golf-balls": [
        b("logo-Titleist-5191ae6257.webp", "Titleist"),
        b("logo-Callaway-1361699423.webp", "Callaway"),
        b("logo-TaylorMade-2f17ac4849.webp", "TaylorMade"),
        b("logo-Bridgestone-f255386e56.webp", "Bridgestone"),
        b("logo-Srixon-8c85331b79.webp", "Srixon"),
        b("logo-Wilson-191b062a9b.webp", "Wilson"),
        b("logo-Mizuno-727c9d8d93.webp", "Mizuno"),
        b("logo-COBRA-111ec06575.webp", "Cobra"),
        b("PXG-Shadow-Black-c6e8303caf.webp", "PXG"),
    ],
    "equipment/accessories-and-training": [
        b("logo-launchmonitor-skytrak-ba9732a2d1.webp", "SkyTrak"),
        b("Rapsodo_Logo_1200x1200_clipped_rev_1-c18b6c2dbf.webp", "Rapsodo"),
        b("Full-Swing_clipped_rev_1-5729190e47.webp", "Full Swing"),
        b("logo-Garmin-2a8d606082.webp", "Garmin"),
        b("logo-Bushnell-1c8ff2bc7e.webp", "Bushnell"),
        b("blue-tees-golf-logo-jpg_50fddbcdf1bc5728890207d304f83f3a_clipped_rev_1-0cbd336d23.webp", "Blue Tees"),
        b("whoop-logo-png_seeklogo-472254-e39fbea7ec.webp", "WHOOP"),
        b("CarlsPlace_Logo_Black-18bcd41d71.webp", "Carl's Place"),
        b("logo-PING-3f87d394b0.webp", "PING"),
        b("logo-LAB-Golf-9b9bf42472.webp", "L.A.B. Golf"),
        b("uskidsgolf-primary-2025-8f82ea3f5c.webp", "U.S. Kids Golf"),
    ],
};

const ALL_BRANDS = Object.values(LOGO_BUCKETS)
    .flat()
    .filter((x, i, all) => all.findIndex((y) => y.name === x.name) === i);

/**
 * A stable, category-appropriate brand logo for a product. Titles that start with a known
 * brand ("Titleist Pro V1…") use that brand; Fox catalog items (which don't name one) get a
 * hashed pick from a bucket of brands that make that product type. Food has no brand.
 */
/** Model names that identify a ball brand when the title doesn't say it. */
const MODEL_BRANDS: [RegExp, string][] = [
    [/\b(pro v1x?|avx|trufeel|tour speed|velocity)\b/i, "Titleist"],
    [/\b(chrome (soft|tour)|supersoft|warbird|erc soft)\b/i, "Callaway"],
    [/\b(tp5x?|tour response|distance(?=\+)|soft response)\b/i, "TaylorMade"],
    [/\b([zq]-star|soft feel)\b/i, "Srixon"],
    [/\b(tour b|e6|e12)\b/i, "Bridgestone"],
    [/\b(victory tour|air max|infinity tour)\b/i, "Nike"],
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export const logoFor = (p: ShopProduct): BrandLogo | null => {
    if (p.kind === "food") return null;
    const byName = ALL_BRANDS.find((x) => new RegExp(`(^|\\s)${escape(x.name)}(\\s|$)`, "i").test(p.title));
    const model = MODEL_BRANDS.find(([re]) => re.test(p.title))?.[1];
    const named = byName ?? ALL_BRANDS.find((x) => x.name === model);
    if (named) return { src: `store-images/logos/${named.file}`, name: named.name };
    // Golf balls are always branded by model — never guess one.
    if (p.group === "golf-balls" || !p.src.startsWith("store-images/")) return null;
    const bucket = LOGO_BUCKETS[`${p.category}/${p.subcategory}`] ?? [];
    if (bucket.length === 0) return null;
    const pick = bucket[hashId(p.id) % bucket.length];
    return { src: `store-images/logos/${pick.file}`, name: pick.name };
};

/* ------------------------------------------------------------------ */
/* Stars                                                               */
/* ------------------------------------------------------------------ */

const FillStar = ({ fill, size }: { fill: number; size: string }) => (
    <span className={cx("relative inline-block shrink-0", size)}>
        <Star01 className={cx("absolute inset-0 text-utility-yellow-200", size)} aria-hidden="true" />
        <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star01 className={cx("fill-utility-yellow-400 text-utility-yellow-400", size)} aria-hidden="true" />
        </span>
    </span>
);

export const StarRating = ({ rating, count, size = "sm", className }: { rating: number; count?: number; size?: "sm" | "md"; className?: string }) => {
    const r = Math.round(rating * 2) / 2;
    const s = size === "md" ? "size-4" : "size-3.5";
    return (
        <span className={cx("flex items-center gap-1.5", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars${count != null ? `, ${count} ratings` : ""}`}>
            <span className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                    <FillStar key={i} size={s} fill={Math.max(0, Math.min(1, r - i))} />
                ))}
            </span>
            {count !== undefined && <span className="text-xs text-tertiary tabular-nums">({count})</span>}
        </span>
    );
};

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

export interface CardBadge {
    label: string;
    tone: TagTone;
    variant: "solid" | "soft";
}

/** Up to two promo badges: Sold out · Sale · Best seller · Only N left (real stock). */
export const badgesFor = (p: ShopProduct): CardBadge[] => {
    if (isSoldOut(p)) return [{ label: "Sold out", tone: "gray", variant: "solid" }];
    const out: CardBadge[] = [];
    if (p.onSale && p.salePrice) out.push({ label: "Sale", tone: "error", variant: "solid" });
    if (p.kind === "retail" && p.reviews >= 160) out.push({ label: "Best seller", tone: "brand", variant: "solid" });
    if (p.stock <= 10) out.push({ label: `Only ${p.stock} left`, tone: "warning", variant: "soft" });
    return out.slice(0, 2);
};

/* ------------------------------------------------------------------ */
/* Product image (with placeholder for missing / broken src)           */
/* ------------------------------------------------------------------ */

export const ProductImage = ({ product, src = product.src, className, padded = true }: { product: ShopProduct; src?: string; className?: string; padded?: boolean }) => {
    const [broken, setBroken] = useState(false);
    useEffect(() => setBroken(false), [src]);
    const food = product.kind === "food";
    if (!src || broken) {
        const Icon: FC<{ className?: string }> = food ? ShoppingBag01 : Image01;
        return (
            <span className={cx("flex size-full items-center justify-center bg-secondary", className)}>
                <span className="flex size-14 items-center justify-center rounded-xl bg-primary text-fg-quaternary ring-1 ring-secondary ring-inset">
                    <Icon className="size-7" aria-hidden="true" />
                </span>
            </span>
        );
    }
    return (
        <img
            src={src}
            alt={product.title}
            loading="lazy"
            onError={() => setBroken(true)}
            className={cx("size-full", food ? "object-cover" : cx("object-contain", padded && "p-5"), className)}
        />
    );
};

/* ------------------------------------------------------------------ */
/* Price                                                               */
/* ------------------------------------------------------------------ */

export const Price = ({ product, size = "sm" }: { product: ShopProduct; size?: "sm" | "lg" }) => {
    const big = size === "lg";
    if (product.onSale && product.salePrice)
        return (
            <span className="flex items-baseline gap-2">
                <span className={cx("font-semibold text-error-primary tabular-nums", big ? "text-display-xs" : "text-sm")}>{money(product.salePrice)}</span>
                <span className={cx("text-tertiary line-through tabular-nums", big ? "text-lg" : "text-sm")}>
                    <span className="sr-only">Was </span>
                    {money(product.price)}
                </span>
            </span>
        );
    return <span className={cx("font-semibold tabular-nums", big ? "text-display-xs" : "text-sm", isSoldOut(product) ? "text-tertiary" : "text-primary")}>{money(product.price)}</span>;
};

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

export const HeartButton = ({ saved, onToggle, className }: { saved?: boolean; onToggle?: () => void; className?: string }) => (
    <AriaButton
        aria-label={saved ? "Remove from saved" : "Save"}
        aria-pressed={saved}
        onPress={onToggle}
        className={cx(
            "flex size-9 cursor-pointer items-center justify-center rounded-full ring-1 transition duration-100 ease-linear outline-none ring-inset focus-visible:ring-4 focus-visible:ring-brand-300/60",
            saved ? "bg-brand-solid text-white ring-transparent" : "bg-primary text-fg-secondary ring-secondary hover:text-fg-primary",
            className,
        )}
    >
        <Heart strokeWidth={2.25} className={cx("size-4.5", saved && "fill-current")} aria-hidden="true" />
    </AriaButton>
);

export interface ProductCardProps {
    product: ShopProduct;
    saved?: boolean;
    onToggleSave?: () => void;
    className?: string;
}

/**
 * ProductCard — image (badges top-left, heart bottom-right), brand, title, rating, price.
 * Food cards drop the brand row and the rating, like CraneWeb's snack-bar items.
 */
export const ProductCard = ({ product, saved, onToggleSave, className }: ProductCardProps) => {
    const logo = logoFor(product);
    const href = productPath(product);
    const soldOut = isSoldOut(product);
    return (
        <div className={cx("group flex min-w-0 flex-col", className)}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset transition duration-100 ease-linear group-hover:ring-brand">
                <WebLink href={href} aria-label={product.title} className="block size-full outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60 focus-visible:ring-inset">
                    <ProductImage product={product} className={cx(soldOut && "opacity-60")} />
                </WebLink>
                <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
                    {badgesFor(product).map((x) => (
                        <Tag key={x.label} tone={x.tone} variant={x.variant} className="h-5 px-2 text-[10.5px]">
                            {x.label}
                        </Tag>
                    ))}
                </div>
                {onToggleSave && <HeartButton saved={saved} onToggle={onToggleSave} className="absolute right-3 bottom-3" />}
            </div>

            {logo && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary ring-1 ring-secondary ring-inset">
                        <img src={logo.src} alt="" className="max-h-3.5 max-w-3.5 object-contain" loading="lazy" />
                    </span>
                    <span className="truncate text-xs font-medium text-secondary">{logo.name}</span>
                </div>
            )}
            <WebLink href={href} className={cx("line-clamp-2 text-sm font-medium text-primary outline-none hover:underline focus-visible:underline", logo ? "mt-1.5" : "mt-3")}>
                {product.title}
            </WebLink>
            {product.kind === "retail" && product.reviews > 0 && <StarRating rating={product.rating} count={product.reviews} className="mt-1.5" />}
            <div className="mt-1.5">
                <Price product={product} />
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Saved items (page-local, a few pre-saved so the Saved filter shows) */
/* ------------------------------------------------------------------ */

const PRE_SAVED = SHOP_PRODUCTS.filter((_, i) => i % 9 === 4).map((p) => p.id);

export const useSaved = () => {
    const [saved, setSaved] = useState<Set<string>>(() => new Set(PRE_SAVED));
    const toggle = (id: string) =>
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    return { saved, toggle };
};

/* ------------------------------------------------------------------ */
/* Filters (Fox Shop All: Sort by · On sale · Price · In stock · Saved) */
/* ------------------------------------------------------------------ */

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "reviews";
export const SORTS: { key: SortKey; label: string }[] = [
    { key: "featured", label: "Featured" },
    { key: "price-asc", label: "Price: low to high" },
    { key: "price-desc", label: "Price: high to low" },
    { key: "rating", label: "Top rated" },
    { key: "reviews", label: "Most reviewed" },
];

export type PriceKey = "u50" | "50-100" | "100-200" | "200p";
export const PRICES: { key: PriceKey; label: string; test: (n: number) => boolean }[] = [
    { key: "u50", label: "Under $50", test: (n) => n < 50 },
    { key: "50-100", label: "$50 – $100", test: (n) => n >= 50 && n < 100 },
    { key: "100-200", label: "$100 – $200", test: (n) => n >= 100 && n < 200 },
    { key: "200p", label: "$200 & up", test: (n) => n >= 200 },
];

export interface ShopFilters {
    sort: SortKey;
    onSale: boolean;
    inStock: boolean;
    saved: boolean;
    price: PriceKey | null;
}
export const NO_FILTERS: ShopFilters = { sort: "featured", onSale: false, inStock: false, saved: false, price: null };
export const hasFilters = (f: ShopFilters) => f.onSale || f.inStock || f.saved || f.price !== null;

export const matchesQuery = (p: ShopProduct, q: string) => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const hay = p.title.toLowerCase();
    return words.every((w) => hay.includes(w));
};

export const applyFilters = (list: ShopProduct[], f: ShopFilters, saved: Set<string>, query = "") => {
    let out = list.slice();
    if (query.trim()) out = out.filter((p) => matchesQuery(p, query));
    if (f.onSale) out = out.filter((p) => p.onSale);
    if (f.inStock) out = out.filter((p) => !isSoldOut(p));
    if (f.saved) out = out.filter((p) => saved.has(p.id));
    if (f.price) {
        const test = PRICES.find((x) => x.key === f.price)!.test;
        out = out.filter((p) => test(priceOf(p)));
    }
    if (f.sort === "price-asc") out.sort((a, b) => priceOf(a) - priceOf(b));
    else if (f.sort === "price-desc") out.sort((a, b) => priceOf(b) - priceOf(a));
    else if (f.sort === "rating") out.sort((a, b) => b.rating - a.rating);
    else if (f.sort === "reviews") out.sort((a, b) => b.reviews - a.reviews);
    return out;
};

const chip = "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 @tablet:px-3.5 text-sm font-medium ring-1 transition duration-100 ease-linear outline-none ring-inset focus-visible:ring-4 focus-visible:ring-brand-300/60";
const chipOn = "bg-primary-solid text-white ring-transparent";
const chipOff = "bg-primary text-secondary ring-secondary hover:bg-primary_hover";

export const Chip = ({ active, onPress, children, chevron, open, ...props }: { active?: boolean; onPress: () => void; children: ReactNode; chevron?: boolean; open?: boolean; "aria-haspopup"?: "menu"; "aria-expanded"?: boolean }) => (
    <AriaButton {...props} onPress={onPress} aria-pressed={chevron ? undefined : !!active} className={cx(chip, active ? chipOn : chipOff)}>
        {children}
        {chevron && <ChevronDown className={cx("size-4 transition duration-100 ease-linear", open && "rotate-180")} aria-hidden="true" />}
    </AriaButton>
);

/** Dropdown menu anchored under a chip (no portal, so it stays correct inside a scaled WebFrame). */
const ChipMenu = <K extends string>({ label, active, options, value, onChange }: { label: string; active: boolean; options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);
    return (
        <div ref={ref} className="relative">
            <Chip active={active} chevron open={open} onPress={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
                {label}
            </Chip>
            {open && (
                <div role="menu" className="absolute top-full left-0 z-40 mt-2 min-w-52 rounded-xl bg-primary p-1.5 shadow-lg ring-1 ring-secondary_alt">
                    {options.map((o) => (
                        <button
                            key={o.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={o.key === value}
                            onClick={() => {
                                onChange(o.key);
                                setOpen(false);
                            }}
                            className={cx(
                                "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm outline-none transition duration-100 ease-linear focus-visible:bg-primary_hover",
                                o.key === value ? "bg-active font-medium text-primary" : "text-secondary hover:bg-primary_hover",
                            )}
                        >
                            {o.label}
                            {o.key === value && <Check className="size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FilterBar = ({ filters, onChange, count, className }: { filters: ShopFilters; onChange: (f: ShopFilters) => void; count?: number; className?: string }) => {
    const set = (patch: Partial<ShopFilters>) => onChange({ ...filters, ...patch });
    const sortLabel = filters.sort === "featured" ? "Sort by" : SORTS.find((s) => s.key === filters.sort)!.label;
    const priceLabel = filters.price ? PRICES.find((p) => p.key === filters.price)!.label : "Price";
    return (
        <div className={cx("flex flex-wrap items-center gap-1.5 @tablet:gap-2", className)}>
            <ChipMenu label={sortLabel} active={filters.sort !== "featured"} options={SORTS} value={filters.sort} onChange={(sort) => set({ sort })} />
            <Chip active={filters.onSale} onPress={() => set({ onSale: !filters.onSale })}>
                On sale
            </Chip>
            <ChipMenu<PriceKey | "any">
                label={priceLabel}
                active={!!filters.price}
                options={[{ key: "any", label: "Any price" }, ...PRICES]}
                value={filters.price ?? "any"}
                onChange={(k) => set({ price: k === "any" ? null : k })}
            />
            <Chip active={filters.inStock} onPress={() => set({ inStock: !filters.inStock })}>
                In stock
            </Chip>
            <Chip active={filters.saved} onPress={() => set({ saved: !filters.saved })}>
                <Heart className={cx("size-4", filters.saved && "fill-current")} aria-hidden="true" />
                <span className="sr-only @tablet:not-sr-only">Saved</span>
            </Chip>
            {hasFilters(filters) && (
                <AriaButton onPress={() => onChange({ ...NO_FILTERS, sort: filters.sort })} className="h-9 cursor-pointer px-2 text-sm font-semibold text-brand-secondary outline-none hover:underline focus-visible:underline">
                    Clear filters
                </AriaButton>
            )}
            {count != null && <span className="ml-auto text-sm text-tertiary tabular-nums">{count === 1 ? "1 item" : `${count} items`}</span>}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Grid + empty                                                        */
/* ------------------------------------------------------------------ */

const PAGE = 24;

/** Product grid with "Show more" paging so long categories don't become one endless scroll. */
export const ProductGrid = ({ products, saved, onToggleSave, dense }: { products: ShopProduct[]; saved: Set<string>; onToggleSave: (id: string) => void; dense?: boolean }) => {
    const [limit, setLimit] = useState(PAGE);
    const shown = products.slice(0, limit);
    return (
        <>
            <div className={cx("grid grid-cols-2 gap-x-4 gap-y-8 @tablet:gap-x-5", dense ? "@tablet:grid-cols-2 @desktop:grid-cols-3" : "@tablet:grid-cols-3 @desktop:grid-cols-4")}>
                {shown.map((p) => (
                    <ProductCard key={p.id} product={p} saved={saved.has(p.id)} onToggleSave={() => onToggleSave(p.id)} />
                ))}
            </div>
            {products.length > limit && (
                <div className="mt-10 flex flex-col items-center gap-3">
                    <p className="text-sm text-tertiary tabular-nums">
                        Showing {shown.length} of {products.length}
                    </p>
                    <WebButton color="outline" onPress={() => setLimit((l) => l + PAGE)}>
                        Show more
                    </WebButton>
                </div>
            )}
        </>
    );
};

export const NoResults = ({ query, onClear, title, description }: { query?: string; onClear?: () => void; title?: ReactNode; description?: ReactNode }) => (
    <div className="flex flex-col items-center rounded-xl bg-primary px-6 py-16 text-center ring-1 ring-secondary ring-inset">
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-fg-quaternary">
            <SearchLg className="size-6" aria-hidden="true" />
        </span>
        <p className="text-lg font-semibold text-primary">{title ?? (query ? `No results for “${query}”` : "No products match your filters")}</p>
        <p className="mt-1 max-w-sm text-sm text-tertiary">{description ?? (query ? "Check the spelling, or search all categories." : "Try clearing a filter to see more.")}</p>
        {onClear && (
            <WebButton color="outline" className="mt-5" onPress={onClear}>
                {query ? "Clear search" : "Clear filters"}
            </WebButton>
        )}
    </div>
);

/* ------------------------------------------------------------------ */
/* Search field (web type scale)                                       */
/* ------------------------------------------------------------------ */

export const ShopSearchField = ({ value, onChange, placeholder = "Search the shop", className, autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean }) => (
    <AriaSearchField value={value} onChange={onChange} aria-label={placeholder} autoFocus={autoFocus} className={cx("group", className)}>
        <div className="flex h-10 items-center gap-2 rounded-lg bg-primary px-3 ring-1 ring-primary ring-inset group-focus-within:ring-2 group-focus-within:ring-brand">
            <SearchLg className="size-[18px] shrink-0 text-fg-quaternary" aria-hidden="true" />
            <AriaInput placeholder={placeholder} className="h-full min-w-0 flex-1 bg-transparent text-md text-primary outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden" />
            <AriaButton aria-label="Clear search" className="flex size-6 cursor-pointer items-center justify-center text-fg-quaternary outline-none group-data-[empty]:hidden">
                <XCircle className="size-[18px]" aria-hidden="true" />
            </AriaButton>
        </div>
    </AriaSearchField>
);
