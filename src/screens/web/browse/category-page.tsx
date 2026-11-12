import { useState } from "react";
import { SectionHeading } from "@/components/web/web-layout";
import { useWebRouter } from "@/components/web/web-router";
import { groupBySlug, productsIn } from "@/data/shop";
import { ShopFrame, ShopNote } from "./shop-frame";
import { crumbsFor, type CategoryNavVariant } from "./shop-nav";
import { applyFilters, FilterBar, NO_FILTERS, NoResults, ProductGrid, useSaved, WebButton, type ShopFilters } from "./shop-ui";

export interface CategoryPageProps {
    /** Group slug from SHOP_GROUPS, e.g. "golf-balls". */
    group: string;
    /** Subgroup slug, e.g. "dozens". Omit for "All Golf Balls". */
    subgroup?: string;
    variant?: CategoryNavVariant;
    initialQuery?: string;
    initialFilters?: Partial<ShopFilters>;
    initialCategoriesOpen?: boolean;
}

/**
 * /shop/:group and /shop/:group/:subgroup — category navigation (tabs or sidebar), title,
 * filter chips, product grid, and empty / not-found states.
 */
export const CategoryPage = ({ group, subgroup, variant = "tabs", initialQuery = "", initialFilters, initialCategoriesOpen }: CategoryPageProps) => {
    const { navigate } = useWebRouter();
    const [query, setQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<ShopFilters>({ ...NO_FILTERS, ...initialFilters });
    const { saved, toggle } = useSaved();

    const g = groupBySlug(group);
    const s = subgroup ? g?.subgroups.find((x) => x.slug === subgroup) : undefined;
    const notFound = !g || (subgroup != null && !s);
    const label = s?.label ?? g?.label ?? "Shop";
    const products = notFound ? [] : productsIn(group, subgroup);
    const list = applyFilters(products, filters, saved, query);
    const isFood = products.length > 0 && products.every((p) => p.kind === "food");
    const sidebar = variant === "sidebar";

    const frame = {
        variant,
        group: notFound ? undefined : group,
        subgroup: notFound ? undefined : subgroup,
        crumbs: notFound ? [{ label: "Shop", href: "/shop" }, { label: "Not found" }] : crumbsFor(group, subgroup),
        query,
        onQuery: setQuery,
        searchPlaceholder: `Search ${label}`,
        initialCategoriesOpen,
    };

    if (notFound)
        return (
            <ShopFrame {...frame} title="Shop">
                <NoResults title="We couldn’t find that category" description="It may have moved or been renamed. Browse everything in the shop instead." />
                <div className="mt-6 flex justify-center">
                    <WebButton onPress={() => navigate("/shop")}>Back to Shop</WebButton>
                </div>
            </ShopFrame>
        );

    // Tabs: the group is the page title and the subgroup heads the grid. Sidebar: breadcrumb + the most specific title.
    const title = sidebar ? label : g.label;

    return (
        <ShopFrame {...frame} title={title} eyebrow={sidebar ? undefined : "Shop"}>
            {query.trim() ? (
                <SectionHeading title={`Results for “${query.trim()}”`} count={list.length} />
            ) : (
                !sidebar && <SectionHeading title={s ? s.label : `All ${g.label}`} count={list.length} />
            )}
            {isFood && <ShopNote className="mb-5">Food & drinks are made at the Snack Bar for pickup, and check out separately from pro shop items.</ShopNote>}
            <FilterBar filters={filters} onChange={setFilters} count={sidebar ? list.length : undefined} className="mb-6" />
            {products.length === 0 ? (
                <NoResults title={`No ${label} yet`} description="Nothing is stocked here right now. Check back soon, or browse the rest of the shop." />
            ) : list.length === 0 ? (
                query.trim() ? (
                    <NoResults query={query.trim()} onClear={() => setQuery("")} />
                ) : (
                    <NoResults onClear={() => setFilters({ ...NO_FILTERS, sort: filters.sort })} />
                )
            ) : (
                <ProductGrid key={`${group}/${subgroup}`} products={list} saved={saved} onToggleSave={toggle} dense={sidebar} />
            )}
        </ShopFrame>
    );
};
