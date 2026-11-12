import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Expand01, Heart, InfoCircle, Minus, Plus, Share07, ShoppingCart01, ThumbsUp } from "@untitledui/icons";
import {
    Button as AriaButton,
    Disclosure as AriaDisclosure,
    DisclosurePanel as AriaDisclosurePanel,
    Heading as AriaHeading,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    Label as AriaLabel,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { WebDialog } from "@/components/web/web-dialog";
import { SectionHeading, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { FREE_SHIPPING_THRESHOLD, GROUND_SHIPPING, groupBySlug, priceOf, productById, productPath, productsIn, SHOP_PRODUCTS, shopPath, type ShopProduct } from "@/data/shop";
import { STORE_PRODUCTS } from "@/data/store-catalog";
import { WebShell, useWebSession } from "@/screens/web/web-shell";
import { AddedNotice, useAddToCart } from "./add-to-cart";
import { Breadcrumb, crumbsFor } from "./shop-nav";
import { hashId, isSoldOut, logoFor, money, NoResults, Price, ProductCard, ProductImage, StarRating, useSaved, WebButton } from "./shop-ui";

/* ------------------------------------------------------------------ */
/* Content (ported from Fox store-product.stories.tsx)                 */
/* ------------------------------------------------------------------ */

const DESCRIPTIONS: Record<string, string[]> = {
    "apparel/mens": ["Moisture-wicking performance fabric", "4-way stretch for an unrestricted swing", "UPF 30 sun protection", "Tailored athletic fit", "Machine washable"],
    "apparel/womens": ["Soft moisture-wicking knit", "4-way stretch with a flattering fit", "UPF 30 sun protection", "Breathable, lightweight feel", "Machine washable"],
    shoes: ["Waterproof construction", "Spikeless multi-directional traction", "Cushioned, responsive midsole", "Breathable engineered upper", "All-day on-course comfort"],
    "golf-balls": ["Tour-level distance and control", "Soft urethane cover for greenside spin", "Low long-game spin for straighter flight", "Consistent, penetrating ball flight"],
    accessories: ["Durable, premium build", "Portable, range-ready design", "Quick setup, no tools needed", "Great for all skill levels"],
    "snack-bar": ["Made to order at the Snack Bar", "Ready for pickup in about 10 minutes", "Ask the counter about allergens and substitutions"],
};
const descriptionFor = (p: ShopProduct) => DESCRIPTIONS[`${p.group}/${p.subgroup}`] ?? DESCRIPTIONS[p.group] ?? DESCRIPTIONS.accessories;

const REVIEWS = [
    { initial: "A", author: "Antonio", date: "January 11, 2026", stars: 5, title: "Amazing", text: "Exactly as pictured and the quality is excellent. Picked it up at the pro shop the same day." },
    { initial: "C", author: "CarlJason", date: "May 16, 2026", stars: 5, title: "Love it", text: "Comfortable and looks sharp out on the course. Would buy again." },
    { initial: "M", author: "Maria", date: "March 3, 2026", stars: 4, title: "Solid pick", text: "Good value for the price. Runs slightly large — size down if between." },
    { initial: "D", author: "Dontae", date: "May 5, 2026", stars: 5, title: "Stands out", text: "Great feel and gets compliments every round. Highly recommend." },
    { initial: "E", author: "Edward", date: "April 27, 2026", stars: 5, title: "Top notch", text: "Premium feel and performs exactly as advertised. No complaints." },
    { initial: "S", author: "Sera", date: "April 18, 2026", stars: 2, title: "Slow shipping", text: "Product is nice but it took far longer to arrive than expected." },
];
const DISTRIBUTION = [0.72, 0.19, 0.05, 0.025, 0.015];

/** Fox's multi-view gallery for its featured golf shoe. */
const SHOE_GALLERY = [
    "252e3653-7463-4a15-91f8-37e0799da622_350x.jpg",
    "424f03d4-3cda-4d55-bf3b-47c7dfac2e4f_350x.jpg",
    "5811573e-a0ad-4f67-81df-765428bb7db3_350x.jpg",
    "72534f2a-5994-40ac-969b-312904f84c1a_350x.jpg",
    "7cee94ba-4a27-4c90-83f6-0886fce32496_350x.jpg",
    "a0a89103-fae1-47bd-9672-b04a1626d960_350x.jpg",
].map((f) => `store-images/apparel/shoes/${f}`);
export const GALLERY_SHOE_ID = STORE_PRODUCTS.find((p) => p.inStock && p.category === "shoes")?.id;

const imagesFor = (p: ShopProduct) => (p.id === GALLERY_SHOE_ID ? SHOE_GALLERY : p.src ? [p.src] : [""]);

/* ------------------------------------------------------------------ */
/* Variants                                                            */
/* ------------------------------------------------------------------ */

interface SizeOption {
    value: string;
    unavailable: boolean;
}

/** Apparel sizes / shoe sizes, with a couple sold out per product (deterministic). */
const sizesFor = (p: ShopProduct): { label: string; options: SizeOption[] } | null => {
    const h = hashId(p.id);
    const mark = (vals: string[]) => vals.map((value, i) => ({ value, unavailable: (h >> i) % 7 === 0 }));
    if (p.group === "apparel") return { label: "Size", options: mark(["XS", "S", "M", "L", "XL", "XXL"]) };
    if (p.group === "shoes") return { label: "Size (US)", options: mark(["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12", "13"]) };
    return null;
};

const packBase = (title: string) =>
    title
        .replace(/\(.*?\)/g, "")
        .replace(/\b(golf balls?|sleeve|recycled)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
const packLabel = (title: string) => {
    const m = title.match(/\(([^)]*)\)/);
    if (/sleeve/i.test(title)) return "Sleeve (3)";
    if (!m) return "Single";
    return m[1].replace(/,.*$/, "");
};

/** Ball packs are separate SKUs (dozen vs sleeve) — the "Pack" chips link between them. */
const packSiblings = (p: ShopProduct) => {
    if (p.group !== "golf-balls") return [];
    const base = packBase(p.title);
    const sibs = SHOP_PRODUCTS.filter((x) => x.group === "golf-balls" && packBase(x.title) === base);
    return sibs.length > 1 ? sibs.sort((a, b) => priceOf(b) - priceOf(a)) : [];
};

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

const arrow = "flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-fg-secondary shadow-md ring-1 ring-secondary outline-none transition duration-100 ease-linear hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60";

const Thumb = ({ product, src, index, active, onPress }: { product: ShopProduct; src: string; index: number; active: boolean; onPress: () => void }) => (
    <AriaButton
        onPress={onPress}
        aria-label={`View image ${index + 1}`}
        aria-pressed={active}
        className={cx("size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-primary outline-none transition duration-100 ease-linear ring-inset focus-visible:ring-4 focus-visible:ring-brand-300/60", active ? "ring-2 ring-brand" : "ring-1 ring-secondary hover:ring-brand")}
    >
        <ProductImage product={product} src={src} className="p-1.5" padded={false} />
    </AriaButton>
);

const Gallery = ({ product }: { product: ShopProduct }) => {
    const images = imagesFor(product);
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const go = (d: number) => setActive((a) => (a + d + images.length) % images.length);
    const many = images.length > 1;
    const soldOut = isSoldOut(product);

    return (
        <div className="flex flex-col-reverse gap-3 @desktop:flex-row">
            {many && (
                <div className="scrollbar-hide flex gap-3 overflow-x-auto @desktop:flex-col @desktop:overflow-visible">
                    {images.map((src, i) => (
                        <Thumb key={src} product={product} src={src} index={i} active={i === active} onPress={() => setActive(i)} />
                    ))}
                </div>
            )}
            <div className="group relative aspect-square flex-1 overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                <AriaButton onPress={() => setOpen(true)} aria-label="Expand image" isDisabled={!images[active]} className="block size-full cursor-zoom-in outline-none disabled:cursor-default">
                    <ProductImage key={active} product={product} src={images[active]} className={cx(product.kind !== "food" && "p-10 @desktop:p-14", soldOut && "opacity-60", "animate-in fade-in duration-300")} />
                </AriaButton>
                <span className="pointer-events-none absolute top-4 left-4 flex flex-col items-start gap-1.5">
                    {soldOut ? <StatusBadge tone="gray" className="text-sm">Sold out</StatusBadge> : product.onSale && <StatusBadge tone="error" className="text-sm">Sale</StatusBadge>}
                </span>
                {images[active] && (
                    <span className="pointer-events-none absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-primary text-fg-quaternary ring-1 ring-secondary">
                        <Expand01 className="size-4" aria-hidden="true" />
                    </span>
                )}
                {many && (
                    <>
                        <AriaButton aria-label="Previous image" onPress={() => go(-1)} className={cx(arrow, "absolute top-1/2 left-3 -translate-y-1/2 @desktop:opacity-0 @desktop:group-hover:opacity-100")}>
                            <ChevronLeft className="size-5" aria-hidden="true" />
                        </AriaButton>
                        <AriaButton aria-label="Next image" onPress={() => go(1)} className={cx(arrow, "absolute top-1/2 right-3 -translate-y-1/2 @desktop:opacity-0 @desktop:group-hover:opacity-100")}>
                            <ChevronRight className="size-5" aria-hidden="true" />
                        </AriaButton>
                    </>
                )}
            </div>

            <WebDialog isOpen={open} onOpenChange={setOpen} title={product.title} size="lg">
                <div className="flex flex-col gap-4">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset @tablet:aspect-[4/3]">
                        <ProductImage key={active} product={product} src={images[active]} className={cx(product.kind !== "food" && "p-8", "animate-in fade-in duration-300")} />
                        {many && (
                            <>
                                <AriaButton aria-label="Previous image" onPress={() => go(-1)} className={cx(arrow, "absolute top-1/2 left-3 -translate-y-1/2")}>
                                    <ChevronLeft className="size-5" aria-hidden="true" />
                                </AriaButton>
                                <AriaButton aria-label="Next image" onPress={() => go(1)} className={cx(arrow, "absolute top-1/2 right-3 -translate-y-1/2")}>
                                    <ChevronRight className="size-5" aria-hidden="true" />
                                </AriaButton>
                            </>
                        )}
                    </div>
                    {many && (
                        <div className="scrollbar-hide flex justify-center gap-3 overflow-x-auto">
                            {images.map((src, i) => (
                                <Thumb key={src} product={product} src={src} index={i} active={i === active} onPress={() => setActive(i)} />
                            ))}
                        </div>
                    )}
                </div>
            </WebDialog>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";
const optionChip = "flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-medium ring-1 transition duration-100 ease-linear ring-inset";

const SizePicker = ({ label, options, value, onChange, invalid }: { label: string; options: SizeOption[]; value: string | null; onChange: (v: string) => void; invalid?: boolean }) => (
    <AriaRadioGroup value={value} onChange={onChange} isInvalid={invalid} className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
            <AriaLabel className="text-sm font-semibold text-primary">
                {label}
                {value && <span className="font-normal text-tertiary"> · {value}</span>}
            </AriaLabel>
            <span className="text-sm text-tertiary underline underline-offset-2">Size guide</span>
        </div>
        <div className="flex flex-wrap gap-2">
            {options.map((o) => (
                <AriaRadio
                    key={o.value}
                    value={o.value}
                    isDisabled={o.unavailable}
                    aria-label={o.unavailable ? `${o.value}, sold out` : o.value}
                    className={({ isSelected, isDisabled, isFocusVisible }) =>
                        cx(
                            optionChip,
                            isSelected ? "bg-primary-solid text-white ring-transparent" : "bg-primary text-secondary ring-primary hover:bg-primary_hover",
                            isDisabled && "cursor-not-allowed bg-secondary text-quaternary line-through ring-secondary hover:bg-secondary",
                            isFocusVisible && "ring-4 ring-brand-300/60",
                        )
                    }
                >
                    {o.value}
                </AriaRadio>
            ))}
        </div>
        {invalid && <p className="text-sm text-error-primary">Select a {label.toLowerCase().replace(/ \(.*\)/, "")} to add this to your cart.</p>}
    </AriaRadioGroup>
);

const PackPicker = ({ product, siblings }: { product: ShopProduct; siblings: ShopProduct[] }) => (
    <div className="flex flex-col gap-2.5">
        <p className="text-sm font-semibold text-primary">
            Pack <span className="font-normal text-tertiary">· {packLabel(product.title)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
            {siblings.map((s) => {
                const on = s.id === product.id;
                return (
                    <WebLink
                        key={s.id}
                        href={productPath(s)}
                        aria-current={on ? "page" : undefined}
                        className={cx(optionChip, "flex-col gap-0 py-1.5", "h-auto", on ? "bg-primary-solid text-white ring-transparent" : "bg-primary text-secondary ring-primary hover:bg-primary_hover", focus)}
                    >
                        <span>{packLabel(s.title)}</span>
                        <span className={cx("text-xs tabular-nums", on ? "text-white/80" : "text-tertiary")}>{money(priceOf(s))}</span>
                    </WebLink>
                );
            })}
        </div>
    </div>
);

const QtyStepper = ({ value, max, onChange }: { value: number; max: number; onChange: (n: number) => void }) => (
    <div className="flex h-12 shrink-0 items-center rounded-lg bg-primary ring-1 ring-primary ring-inset" role="group" aria-label="Quantity">
        <AriaButton aria-label="Decrease quantity" isDisabled={value <= 1} onPress={() => onChange(value - 1)} className={cx("flex size-12 cursor-pointer items-center justify-center rounded-lg text-fg-secondary disabled:cursor-not-allowed disabled:opacity-50", focus)}>
            <Minus className="size-4" aria-hidden="true" />
        </AriaButton>
        <span className="w-8 text-center text-md font-semibold text-primary tabular-nums" aria-live="polite">
            {value}
        </span>
        <AriaButton aria-label="Increase quantity" isDisabled={value >= max} onPress={() => onChange(value + 1)} className={cx("flex size-12 cursor-pointer items-center justify-center rounded-lg text-fg-secondary disabled:cursor-not-allowed disabled:opacity-50", focus)}>
            <Plus className="size-4" aria-hidden="true" />
        </AriaButton>
    </div>
);

const StockLine = ({ product }: { product: ShopProduct }) => {
    if (isSoldOut(product))
        return (
            <p className="flex items-center gap-2 text-sm font-medium text-tertiary">
                <span className="size-2 rounded-full bg-quaternary" aria-hidden="true" /> Out of stock
            </p>
        );
    const low = product.stock <= 10;
    return (
        <p className={cx("flex items-center gap-2 text-sm font-medium", low ? "text-warning-primary" : "text-success-primary")}>
            <span className={cx("size-2 rounded-full", low ? "bg-warning-solid" : "bg-success-solid")} aria-hidden="true" />
            In stock: {product.stock}
            {low && <span className="font-normal text-tertiary">· Only {product.stock} left</span>}
        </p>
    );
};

const Accordion = ({ title, children, defaultExpanded }: { title: string; children: React.ReactNode; defaultExpanded?: boolean }) => (
    <AriaDisclosure defaultExpanded={defaultExpanded} className="group border-b border-secondary">
        <AriaHeading>
            <AriaButton slot="trigger" className={cx("flex w-full cursor-pointer items-center justify-between py-4 text-left text-md font-semibold text-primary", focus)}>
                {title}
                <ChevronDown className="size-5 text-fg-quaternary transition duration-150 ease-linear group-data-[expanded]:rotate-180" aria-hidden="true" />
            </AriaButton>
        </AriaHeading>
        <AriaDisclosurePanel>
            <div className="pb-5 text-sm text-secondary">{children}</div>
        </AriaDisclosurePanel>
    </AriaDisclosure>
);

const Bullets = ({ items }: { items: string[] }) => (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-fg-quaternary">
        {items.map((x) => (
            <li key={x}>{x}</li>
        ))}
    </ul>
);

const Distribution = () => (
    <div className="flex w-full max-w-md flex-col gap-1.5">
        {DISTRIBUTION.map((frac, i) => (
            <div key={i} className="flex items-center gap-3">
                <span className="w-3 text-xs text-tertiary tabular-nums">{5 - i}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span className="block h-full rounded-full bg-brand-solid" style={{ width: `${frac * 100}%` }} />
                </span>
            </div>
        ))}
    </div>
);

const ReviewCard = ({ r }: { r: (typeof REVIEWS)[number] }) => (
    <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4">
        <StarRating rating={r.stars} />
        <p className="text-sm font-semibold text-primary">{r.title}</p>
        <p className="text-sm text-tertiary">{r.text}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <span className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-tertiary text-xs font-semibold text-secondary">{r.initial}</span>
                <span className="text-xs text-tertiary">
                    {r.author} · {r.date}
                </span>
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-tertiary">
                <ThumbsUp className="size-4" aria-hidden="true" /> Helpful
            </span>
        </div>
    </div>
);

const Reviews = ({ product, onAll }: { product: ShopProduct; onAll: () => void }) => (
    <section id="reviews" aria-labelledby="reviews-title" className="rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset @tablet:p-8">
        <h2 id="reviews-title" className="text-xl font-semibold text-primary">
            Reviews
        </h2>
        <div className="mt-5 flex flex-col gap-6 @tablet:flex-row @tablet:items-center @tablet:gap-10">
            <div className="flex shrink-0 flex-col items-start gap-1">
                <span className="text-display-sm font-semibold text-primary tabular-nums">{product.rating.toFixed(1)}</span>
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-tertiary">{product.reviews} ratings</span>
            </div>
            <Distribution />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 @tablet:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r) => (
                <ReviewCard key={r.author} r={r} />
            ))}
        </div>
        <WebButton color="outline" size="lg" fullWidth className="mt-6" onPress={onAll}>
            Read all {product.reviews} reviews
        </WebButton>
    </section>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export interface ProductPageProps {
    productId: string;
    /** Preselect a size (apparel / shoes). */
    initialSize?: string;
    initialQty?: number;
    /** Show the "Added to cart" confirmation (review state; pair with a cart that holds it). */
    initialAdded?: boolean;
    /** Open the mixed-cart dialog for this product (review state; pair with a food cart). */
    initialMixedOpen?: boolean;
}

/**
 * /shop/:group/:subgroup/:productId — Fox's product page in the Crane Web look: gallery,
 * price/sale, size or pack chips, "In stock: N", qty, Add to cart (+ mixed-cart rule),
 * details accordions, reviews, related products. Food items drop brand, sizes and reviews.
 */
export const ProductPage = ({ productId, initialSize, initialQty = 1, initialAdded, initialMixedOpen }: ProductPageProps) => {
    const product = productById(productId);
    if (!product)
        return (
            <WebShell active="shop">
                <WebPage>
                    <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Not found" }]} className="mb-6" />
                    <NoResults title="This product isn’t available" description="It may have sold through or been removed from the shop." />
                </WebPage>
            </WebShell>
        );
    return <ProductView key={product.id} product={product} initialSize={initialSize} initialQty={initialQty} initialAdded={initialAdded} initialMixedOpen={initialMixedOpen} />;
};

const ProductView = ({ product, initialSize, initialQty = 1, initialAdded, initialMixedOpen }: Omit<ProductPageProps, "productId"> & { product: ShopProduct }) => {
    const { course } = useWebSession();
    const food = product.kind === "food";
    const soldOut = isSoldOut(product);
    const sizes = sizesFor(product);
    const packs = packSiblings(product);
    const logo = logoFor(product);
    const g = groupBySlug(product.group);
    const sub = g?.subgroups.find((s) => s.slug === product.subgroup);

    const [size, setSize] = useState<string | null>(initialSize ?? null);
    const [qty, setQty] = useState(initialQty);
    const [needSize, setNeedSize] = useState(false);
    const [savedItem, setSavedItem] = useState(false);
    const [shared, setShared] = useState(false);
    const [notify, setNotify] = useState(false);
    const [reviewsOpen, setReviewsOpen] = useState(false);
    const { saved, toggle } = useSaved();

    const variant = size ?? "";
    const req = { product, variant, qty };
    const { add, added, dismissAdded, dialog } = useAddToCart({ initialAdded: initialAdded ? req : undefined, initialMixed: initialMixedOpen ? req : undefined });

    const onAdd = () => {
        if (sizes && !size) {
            setNeedSize(true);
            return;
        }
        add(req);
    };

    const related = [...productsIn(product.group, product.subgroup), ...productsIn(product.group)]
        .filter((p, i, all) => p.id !== product.id && all.findIndex((x) => x.id === p.id) === i)
        .sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)))
        .slice(0, 4);

    const crumbs = [...crumbsFor(product.group, product.subgroup), { label: product.title }];
    const backHref = shopPath(product.group, sub?.slug);

    return (
        <WebShell active="shop">
            <WebPage>
                <Breadcrumb items={crumbs} className="hidden @tablet:block" />
                <WebLink href={backHref} className={cx("inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary @tablet:hidden", focus)}>
                    <ChevronLeft className="size-4" aria-hidden="true" /> {sub?.label ?? g?.label ?? "Shop"}
                </WebLink>

                <div className="mt-4 grid grid-cols-1 gap-8 @tablet:mt-8 @desktop:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @desktop:gap-14">
                    <Gallery product={product} />

                    <div className="flex flex-col">
                        {food ? (
                            <p className="caps mb-3 text-brand-secondary">
                                {g?.label}
                                {sub ? ` · ${sub.label}` : ""}
                            </p>
                        ) : (
                            logo && (
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary ring-1 ring-secondary ring-inset">
                                        <img src={logo.src} alt="" className="max-h-4 max-w-4 object-contain" />
                                    </span>
                                    <span className="text-sm font-medium text-secondary">{logo.name}</span>
                                </div>
                            )
                        )}
                        <h1 className="text-display-xs font-semibold tracking-[-0.3px] text-primary @tablet:text-display-sm">{product.title}</h1>
                        {!food && product.reviews > 0 && (
                            <AriaButton onPress={() => setReviewsOpen(true)} className={cx("mt-2 flex w-fit cursor-pointer items-center gap-2 rounded text-left", focus)}>
                                <StarRating rating={product.rating} size="md" />
                                <span className="text-sm text-tertiary underline underline-offset-2">{product.reviews} ratings</span>
                            </AriaButton>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                            <Price product={product} size="lg" />
                            {product.onSale && product.salePrice && !soldOut && (
                                <StatusBadge tone="success" className="text-sm">
                                    Save {money(product.price - product.salePrice)}
                                </StatusBadge>
                            )}
                        </div>
                        <div className="mt-3">
                            <StockLine product={product} />
                        </div>

                        {!soldOut && (sizes || packs.length > 0) && (
                            <div className="mt-6 flex flex-col gap-5">
                                {sizes && (
                                    <SizePicker
                                        label={sizes.label}
                                        options={sizes.options}
                                        value={size}
                                        invalid={needSize && !size}
                                        onChange={(v) => {
                                            setSize(v);
                                            setNeedSize(false);
                                        }}
                                    />
                                )}
                                {packs.length > 0 && <PackPicker product={product} siblings={packs} />}
                            </div>
                        )}

                        {soldOut ? (
                            <div className="mt-6">
                                <WebButton size="lg" fullWidth iconLeading={notify ? Check : Heart} color={notify ? "tinted" : "filled"} onPress={() => setNotify(true)}>
                                    {notify ? "We’ll email you when it’s back" : "Notify me when it’s back"}
                                </WebButton>
                                <p className="mt-2.5 flex items-center gap-1.5 text-sm text-tertiary">
                                    <InfoCircle className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                    We’ll email you once when it’s back in stock — nothing else.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 flex gap-3">
                                <QtyStepper value={qty} max={Math.min(product.stock, 20)} onChange={setQty} />
                                <WebButton size="lg" iconLeading={ShoppingCart01} className="flex-1" onPress={onAdd}>
                                    Add to cart · {money(priceOf(product) * qty)}
                                </WebButton>
                            </div>
                        )}

                        {added && (
                            <div className="mt-4">
                                <AddedNotice req={added} onDismiss={dismissAdded} />
                            </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <WebButton color="outline" size="lg" iconLeading={<Heart className={cx("size-5", savedItem && "fill-current text-fg-brand-primary")} aria-hidden="true" />} onPress={() => setSavedItem((s) => !s)}>
                                {savedItem ? "Saved" : "Save"}
                            </WebButton>
                            <WebButton color="outline" size="lg" iconLeading={shared ? Check : Share07} onPress={() => setShared(true)}>
                                {shared ? "Link copied" : "Share"}
                            </WebButton>
                        </div>

                        {food && (
                            <p className="mt-5 flex items-start gap-2 rounded-xl bg-primary px-4 py-3 text-sm text-secondary ring-1 ring-secondary ring-inset">
                                <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                Picked up at the {course.shortName ?? course.name} Snack Bar. Food & drinks check out separately from pro shop items.
                            </p>
                        )}

                        <div className="mt-6 border-t border-secondary">
                            <Accordion title="Details" defaultExpanded>
                                <Bullets items={descriptionFor(product)} />
                            </Accordion>
                            {food ? (
                                <Accordion title="Pickup">
                                    <Bullets items={["Order ahead and pick up at the Snack Bar window", "We’ll text you when it’s ready", "Must be 21+ with ID for beer, wine and cocktails"]} />
                                </Accordion>
                            ) : (
                                <>
                                    <Accordion title="Shipping & pickup">
                                        <Bullets
                                            items={[
                                                `Free in-store pickup at the ${course.shortName ?? course.name} pro shop — usually ready same day`,
                                                `Ground shipping ${money(GROUND_SHIPPING)}, free on orders over ${money(FREE_SHIPPING_THRESHOLD).replace(".00", "")}`,
                                                "Sales tax is calculated at checkout from your ship-to address",
                                            ]}
                                        />
                                    </Accordion>
                                    <Accordion title="Returns">
                                        <Bullets items={["Unworn items with tags can be returned within 30 days", "Golf balls are final sale once the box is opened", "Return in person at the pro shop or by mail"]} />
                                    </Accordion>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {!food && product.reviews > 0 && (
                    <div className="mt-14">
                        <Reviews product={product} onAll={() => setReviewsOpen(true)} />
                    </div>
                )}

                {related.length > 0 && (
                    <section aria-labelledby="related" className="mt-14">
                        <SectionHeading
                            title={<span id="related">{food ? "Add to your order" : "You may also like"}</span>}
                            action={
                                <WebLink href={backHref} className={cx("caps shrink-0 text-brand-secondary hover:underline", focus)}>
                                    View all
                                </WebLink>
                            }
                        />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 @tablet:grid-cols-4 @tablet:gap-x-5">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} saved={saved.has(p.id)} onToggleSave={() => toggle(p.id)} />
                            ))}
                        </div>
                    </section>
                )}

                {dialog}

                <WebDialog isOpen={reviewsOpen} onOpenChange={setReviewsOpen} title="Reviews" description={`${product.rating.toFixed(1)} out of 5 · ${product.reviews} ratings`} size="md">
                    <div className="flex flex-col gap-5">
                        <Distribution />
                        <div className="flex flex-col gap-3">
                            {REVIEWS.map((r) => (
                                <ReviewCard key={r.author} r={r} />
                            ))}
                        </div>
                    </div>
                </WebDialog>
            </WebPage>
        </WebShell>
    );
};
