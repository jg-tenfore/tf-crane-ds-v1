import { useState } from "react";
import { cx } from "@/utils/cx";
import { SectionHeading } from "@/components/web/web-layout";
import { CLUB_OFFERINGS, FEATURED, SHOP_PRODUCTS } from "@/data/shop";
import { useWebSession } from "@/screens/web/web-shell";
import { OfferingCard } from "./card-tiles";
import { ShopFrame } from "./shop-frame";
import type { CategoryNavVariant } from "./shop-nav";
import { applyFilters, FilterBar, NO_FILTERS, NoResults, ProductCard, ProductGrid, useSaved, type ShopFilters } from "./shop-ui";

export interface ShopHomeProps {
    /** A = CraneWeb category tabs, B = Fox sidebar. */
    variant?: CategoryNavVariant;
    initialQuery?: string;
    initialFilters?: Partial<ShopFilters>;
    /** Open the mobile "Categories" sheet on load (review state). */
    initialCategoriesOpen?: boolean;
}

/**
 * /shop — "Shop" title, category navigation, Club Offerings (gift card, punch card,
 * memberships), Featured, then "Shop all" with Fox's filter chips. A search query replaces
 * the sections with results.
 */
export const ShopHome = ({ variant = "tabs", initialQuery = "", initialFilters, initialCategoriesOpen }: ShopHomeProps) => {
    const { course } = useWebSession();
    const [query, setQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<ShopFilters>({ ...NO_FILTERS, ...initialFilters });
    const { saved, toggle } = useSaved();
    const list = applyFilters(SHOP_PRODUCTS, filters, saved, query);
    const sidebar = variant === "sidebar";
    const searching = query.trim().length > 0;
    const featured = FEATURED.filter((p, i) => FEATURED.findIndex((x) => x.id === p.id) === i).slice(0, sidebar ? 6 : 8);

    return (
        <ShopFrame variant={variant} title="Shop" crumbs={[{ label: "Shop" }]} query={query} onQuery={setQuery} initialCategoriesOpen={initialCategoriesOpen}>
            {searching ? (
                <section aria-label="Search results">
                    <SectionHeading title={`Results for “${query.trim()}”`} count={list.length} />
                    <FilterBar filters={filters} onChange={setFilters} className="mb-6" />
                    {list.length > 0 ? <ProductGrid products={list} saved={saved} onToggleSave={toggle} dense={sidebar} /> : <NoResults query={query.trim()} onClear={() => setQuery("")} />}
                </section>
            ) : (
                <div className="flex flex-col gap-12 @tablet:gap-16">
                    <section aria-labelledby="club-offerings">
                        <SectionHeading title={<span id="club-offerings">Club Offerings</span>} count={CLUB_OFFERINGS.length} />
                        {/* Mobile: one swipeable row. Tablet+: grid. */}
                        <div className={cx("scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 @tablet:mx-0 @tablet:grid @tablet:grid-cols-2 @tablet:gap-5 @tablet:overflow-visible @tablet:px-0", !sidebar && "@desktop:grid-cols-4")}>
                            {CLUB_OFFERINGS.map((o) => (
                                <OfferingCard key={o.id} offering={o} course={course} className="w-[272px] shrink-0 snap-start @tablet:w-auto" />
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="featured">
                        <SectionHeading title={<span id="featured">Featured</span>} count={featured.length} />
                        <div className={cx("scrollbar-hide -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 @tablet:mx-0 @tablet:grid @tablet:gap-x-5 @tablet:gap-y-8 @tablet:overflow-visible @tablet:px-0", sidebar ? "@tablet:grid-cols-2 @desktop:grid-cols-3" : "@tablet:grid-cols-3 @desktop:grid-cols-4")}>
                            {featured.map((p) => (
                                <ProductCard key={p.id} product={p} saved={saved.has(p.id)} onToggleSave={() => toggle(p.id)} className="w-[46%] shrink-0 snap-start @tablet:w-auto" />
                            ))}
                        </div>
                    </section>

                    <section aria-labelledby="shop-all">
                        <SectionHeading title={<span id="shop-all">Shop all</span>} count={list.length} />
                        <FilterBar filters={filters} onChange={setFilters} className="mb-6" />
                        {list.length > 0 ? <ProductGrid products={list} saved={saved} onToggleSave={toggle} dense={sidebar} /> : <NoResults onClear={() => setFilters({ ...NO_FILTERS, sort: filters.sort })} />}
                    </section>
                </div>
            )}
        </ShopFrame>
    );
};
