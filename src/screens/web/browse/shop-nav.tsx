import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, LayoutGrid01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { WebDialog } from "@/components/web/web-dialog";
import { CapsTabs } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { groupBySlug, productsIn, SHOP_GROUPS, shopPath } from "@/data/shop";
import { ShopSearchField } from "./shop-ui";

/**
 * Shop category navigation. Two desktop variants for review —
 *  A "tabs": CraneWeb today (category CapsTabs + subgroup CapsTabs)
 *  B "sidebar": Fox (left accordion of groups → subgroups + breadcrumb)
 * — and, below 768, one mobile pattern for both: a sticky bar with search, a chip row and a
 * "Categories" sheet. Groups/subgroups always come from SHOP_GROUPS.
 */
export type CategoryNavVariant = "tabs" | "sidebar";

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/** "Club Offerings" pseudo-categories that live beside the product groups. */
export const OFFERING_LINKS = [
    { href: "/shop/gift-cards", label: "Gift Cards" },
    { href: "/shop/punch-cards", label: "Punch Cards" },
];

/* ------------------------------ A: Tabs ------------------------------ */

export const CategoryTabs = ({ group, subgroup }: { group?: string; subgroup?: string }) => {
    const g = group ? groupBySlug(group) : undefined;
    return (
        <div className="flex flex-col gap-4">
            <CapsTabs
                label="Shop categories"
                className="border-b border-secondary"
                tabs={[{ href: "/shop", label: "All", active: !group }, ...SHOP_GROUPS.map((x) => ({ href: shopPath(x.slug), label: x.label, active: x.slug === group }))]}
            />
            {g && g.subgroups.length > 0 && (
                <CapsTabs
                    label={`${g.label} subcategories`}
                    size="sm"
                    tabs={[{ href: shopPath(g.slug), label: `All ${g.label}`, active: !subgroup }, ...g.subgroups.map((s) => ({ href: shopPath(g.slug, s.slug), label: s.label, active: s.slug === subgroup }))]}
                />
            )}
        </div>
    );
};

/* ------------------------------ B: Sidebar ------------------------------ */

const Count = ({ n }: { n: number }) => <span className="ml-auto text-xs text-quaternary tabular-nums">{n}</span>;

const sideLink = (active: boolean) =>
    cx(
        "relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition duration-100 ease-linear",
        active ? "bg-active font-semibold text-brand-secondary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-fg-brand-primary" : "text-secondary hover:bg-primary_hover hover:text-primary",
        focus,
    );

export const CategorySidebar = ({ group, subgroup, activeHref }: { group?: string; subgroup?: string; activeHref?: string }) => {
    const [open, setOpen] = useState<Set<string>>(() => new Set(group ? [group] : []));
    const toggle = (slug: string) =>
        setOpen((o) => {
            const n = new Set(o);
            if (n.has(slug)) n.delete(slug);
            else n.add(slug);
            return n;
        });
    return (
        <nav aria-label="Shop categories" className="flex flex-col gap-1">
            <p className="caps mb-2 px-3 text-quaternary">Categories</p>
            <WebLink href="/shop" aria-current={!group && !activeHref ? "page" : undefined} className={sideLink(!group && !activeHref)}>
                All products
            </WebLink>
            {SHOP_GROUPS.map((g) => {
                const expanded = open.has(g.slug);
                const onGroup = g.slug === group;
                return (
                    <div key={g.slug}>
                        <div className="flex items-center">
                            <WebLink href={shopPath(g.slug)} aria-current={onGroup && !subgroup ? "page" : undefined} className={cx(sideLink(onGroup && !subgroup), "flex-1", onGroup && subgroup && "font-semibold text-primary")}>
                                {g.label}
                                <Count n={productsIn(g.slug).length} />
                            </WebLink>
                            {g.subgroups.length > 0 && (
                                <AriaButton
                                    aria-label={`${expanded ? "Collapse" : "Expand"} ${g.label}`}
                                    aria-expanded={expanded}
                                    onPress={() => toggle(g.slug)}
                                    className={cx("flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-fg-quaternary hover:bg-primary_hover", focus)}
                                >
                                    <ChevronDown className={cx("size-4 transition duration-100 ease-linear", expanded && "rotate-180")} aria-hidden="true" />
                                </AriaButton>
                            )}
                        </div>
                        {expanded && g.subgroups.length > 0 && (
                            <div className="mt-0.5 mb-1 ml-3 flex flex-col gap-0.5 border-l border-secondary pl-2">
                                {g.subgroups.map((s) => {
                                    const on = onGroup && s.slug === subgroup;
                                    return (
                                        <WebLink key={s.slug} href={shopPath(g.slug, s.slug)} aria-current={on ? "page" : undefined} className={sideLink(on)}>
                                            {s.label}
                                            <Count n={productsIn(g.slug, s.slug).length} />
                                        </WebLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
            <p className="caps mt-6 mb-2 px-3 text-quaternary">Club Offerings</p>
            {OFFERING_LINKS.map((l) => (
                <WebLink key={l.href} href={l.href} aria-current={activeHref === l.href ? "page" : undefined} className={sideLink(activeHref === l.href)}>
                    {l.label}
                </WebLink>
            ))}
        </nav>
    );
};

/* ------------------------------ Breadcrumb ------------------------------ */

export interface Crumb {
    label: string;
    href?: string;
}

/** Shop › Golf Balls › Dozens — every level is a deep link except the current page. */
export const Breadcrumb = ({ items, className }: { items: Crumb[]; className?: string }) => (
    <nav aria-label="Breadcrumb" className={cx("min-w-0", className)}>
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
            {items.map((c, i) => {
                const last = i === items.length - 1;
                return (
                    <Fragment key={`${c.label}-${i}`}>
                        <li className={cx("min-w-0", last ? "truncate" : "shrink-0")}>
                            {c.href && !last ? (
                                <WebLink href={c.href} className={cx("rounded text-tertiary hover:text-primary hover:underline", focus)}>
                                    {c.label}
                                </WebLink>
                            ) : (
                                <span aria-current={last ? "page" : undefined} className="font-medium text-primary">
                                    {c.label}
                                </span>
                            )}
                        </li>
                        {!last && (
                            <li aria-hidden="true" className="shrink-0 text-fg-quaternary">
                                <ChevronRight className="size-4" />
                            </li>
                        )}
                    </Fragment>
                );
            })}
        </ol>
    </nav>
);

export const crumbsFor = (group?: string, subgroup?: string): Crumb[] => {
    const g = group ? groupBySlug(group) : undefined;
    const s = g?.subgroups.find((x) => x.slug === subgroup);
    return [{ label: "Shop", href: "/shop" }, ...(g ? [{ label: g.label, href: shopPath(g.slug) }] : []), ...(g && s ? [{ label: s.label, href: shopPath(g.slug, s.slug) }] : [])];
};

/* ------------------------------ Mobile: sticky bar + sheet ------------------------------ */

/** Height of the sticky WebHeader above us, so the shop bar can stick right under it. */
export const useHeaderOffset = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [top, setTop] = useState(0);
    useLayoutEffect(() => {
        const header = ref.current?.closest(".crane-web")?.querySelector("header");
        if (!header) return;
        // offsetHeight is layout size, unaffected by WebFrame's fit-to-width scale.
        const update = () => setTop(header.offsetHeight);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(header);
        return () => ro.disconnect();
    }, []);
    return { ref, top };
};

const mChip = (active: boolean) =>
    cx(
        "flex h-8 shrink-0 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap ring-1 transition duration-100 ease-linear ring-inset",
        active ? "bg-primary-solid text-white ring-transparent" : "bg-primary text-secondary ring-secondary",
        focus,
    );

export interface MobileShopBarProps {
    group?: string;
    subgroup?: string;
    query: string;
    onQuery: (q: string) => void;
    onCategories: () => void;
    searchPlaceholder?: string;
}

/**
 * Mobile web (<768): sticky under the header — search + "Categories" button, then a scrolling
 * chip row of groups (or of the current group's subgroups), so the shop is never one long scroll.
 */
export const MobileShopBar = ({ group, subgroup, query, onQuery, onCategories, searchPlaceholder }: MobileShopBarProps) => {
    const { ref, top } = useHeaderOffset();
    const g = group ? groupBySlug(group) : undefined;
    return (
        <div ref={ref} style={{ top }} className="sticky z-20 -mx-4 mb-6 border-b border-secondary bg-secondary px-4 pt-3 pb-3 @tablet:hidden">
            <div className="flex items-center gap-2">
                <ShopSearchField value={query} onChange={onQuery} placeholder={searchPlaceholder} className="min-w-0 flex-1" />
                <AriaButton
                    onPress={onCategories}
                    aria-haspopup="dialog"
                    className={cx("flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary ring-1 ring-primary ring-inset", focus)}
                >
                    <LayoutGrid01 className="size-4 text-fg-secondary" aria-hidden="true" />
                    Categories
                </AriaButton>
            </div>
            <nav aria-label={g ? `${g.label} subcategories` : "Shop categories"} className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
                {g ? (
                    <>
                        <WebLink href="/shop" aria-label="All categories" className={cx(mChip(false), "gap-1 pl-2")}>
                            <ChevronRight className="size-4 rotate-180" aria-hidden="true" />
                            Shop
                        </WebLink>
                        <WebLink href={shopPath(g.slug)} aria-current={!subgroup ? "page" : undefined} className={mChip(!subgroup)}>
                            All {g.label}
                        </WebLink>
                        {g.subgroups.map((s) => (
                            <WebLink key={s.slug} href={shopPath(g.slug, s.slug)} aria-current={s.slug === subgroup ? "page" : undefined} className={mChip(s.slug === subgroup)}>
                                {s.label}
                            </WebLink>
                        ))}
                    </>
                ) : (
                    <>
                        <WebLink href="/shop" aria-current="page" className={mChip(true)}>
                            All
                        </WebLink>
                        {SHOP_GROUPS.map((x) => (
                            <WebLink key={x.slug} href={shopPath(x.slug)} className={mChip(false)}>
                                {x.label}
                            </WebLink>
                        ))}
                    </>
                )}
            </nav>
        </div>
    );
};

const sheetRow = (active: boolean, sub?: boolean) =>
    cx(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left transition duration-100 ease-linear hover:bg-primary_hover",
        sub ? "h-10 pl-6 text-sm" : "h-11 text-md font-semibold",
        active ? "bg-active text-brand-secondary" : sub ? "text-secondary" : "text-primary",
        focus,
    );

/** "Categories" sheet (WebDialog → bottom sheet on mobile): every group with its subgroups. */
export const CategoriesDialog = ({ isOpen, onOpenChange, group, subgroup }: { isOpen: boolean; onOpenChange: (o: boolean) => void; group?: string; subgroup?: string }) => {
    const { navigate } = useWebRouter();
    const go = (href: string) => {
        onOpenChange(false);
        navigate(href);
    };
    const Row = ({ href, label, active, sub, count }: { href: string; label: string; active: boolean; sub?: boolean; count?: number }) => (
        <AriaButton onPress={() => go(href)} className={sheetRow(active, sub)}>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {count != null && <span className="text-xs font-normal text-quaternary tabular-nums">{count}</span>}
            {active && <Check className="size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />}
        </AriaButton>
    );
    return (
        <WebDialog isOpen={isOpen} onOpenChange={onOpenChange} title="Categories" size="sm">
            <div className="-mx-3 flex flex-col gap-0.5">
                <Row href="/shop" label="All products" active={!group} />
                {SHOP_GROUPS.map((g) => (
                    <div key={g.slug} className="mt-2 border-t border-secondary pt-2">
                        <Row href={shopPath(g.slug)} label={g.label} active={g.slug === group && !subgroup} count={productsIn(g.slug).length} />
                        {g.subgroups.map((s) => (
                            <Row key={s.slug} sub href={shopPath(g.slug, s.slug)} label={s.label} active={g.slug === group && s.slug === subgroup} count={productsIn(g.slug, s.slug).length} />
                        ))}
                    </div>
                ))}
                <div className="mt-2 border-t border-secondary pt-2">
                    <p className="caps px-3 py-2 text-quaternary">Club Offerings</p>
                    {OFFERING_LINKS.map((l) => (
                        <Row key={l.href} sub href={l.href} label={l.label} active={false} />
                    ))}
                </div>
            </div>
        </WebDialog>
    );
};
