import { useEffect, useRef, type ReactNode } from "react";
import { useWebFrame } from "@/components/web/web-frame";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { groupBySlug, productById } from "@/data/shop";
import { CategoryPage } from "./category-page";
import { GiftCardPage, PunchCardPage } from "./gift-card-page";
import { ProductPage } from "./product-page";
import { ShopHome } from "./shop-home";
import type { CategoryNavVariant } from "./shop-nav";

export interface BrowseRoute {
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/** /shop?category=golf-balls&subcategory=dozens — live CraneWeb's query-string deep links. */
const ShopRoute = ({ variant }: { variant: CategoryNavVariant }) => {
    const { path } = useWebRouter();
    const q = new URLSearchParams(path.split("?")[1] ?? "");
    const category = q.get("category");
    if (category) return <CategoryPage group={category} subgroup={q.get("subcategory") ?? q.get("subgroup") ?? undefined} variant={variant} />;
    return <ShopHome variant={variant} initialQuery={q.get("q") ?? ""} />;
};

/**
 * Shop browsing routes, most specific first (first match wins with matchPath semantics).
 * `/shop/:group/:subgroup?` also covers products in groups without subgroups
 * (`/shop/accessories/<id>`, from productPath) by checking whether the 2nd segment is a product.
 */
export const browseRoutesFor = (variant: CategoryNavVariant = "tabs"): BrowseRoute[] => [
    { pattern: "/shop", render: () => <ShopRoute variant={variant} /> },
    { pattern: "/shop/gift-cards", render: () => <GiftCardPage /> },
    { pattern: "/shop/punch-cards", render: () => <PunchCardPage /> },
    { pattern: "/shop/:group/:subgroup/:productId", render: ({ productId }) => <ProductPage productId={productId} /> },
    {
        pattern: "/shop/:group/:subgroup?",
        render: ({ group, subgroup }) => {
            const isSub = !!subgroup && !!groupBySlug(group)?.subgroups.some((s) => s.slug === subgroup);
            if (subgroup && !isSub && productById(subgroup)) return <ProductPage productId={subgroup} />;
            return <CategoryPage group={group} subgroup={subgroup} variant={variant} />;
        },
    },
];

/** Default route table (variant A, tabs) for the lead's Flow. */
export const browseRoutes: BrowseRoute[] = browseRoutesFor("tabs");

/** First matching browse route for a path, or null (e.g. /cart, /checkout). */
export const resolveBrowseRoute = (path: string, routes: BrowseRoute[] = browseRoutes): ReactNode | null => {
    for (const r of routes) {
        const params = matchPath(r.pattern, path);
        if (params) return r.render(params);
    }
    return null;
};

/**
 * Renders the browse page for the current router path and scrolls the frame to the top on
 * navigation. `initial` (with `initialPath`) lets a story show an explicit-props state until the
 * reviewer clicks away; `fallback` renders paths owned by other areas (cart, checkout).
 */
export const BrowseOutlet = ({ variant = "tabs", initial, initialPath, fallback }: { variant?: CategoryNavVariant; initial?: ReactNode; initialPath?: string; fallback?: (path: string) => ReactNode }) => {
    const { path } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        scrollToTop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);

    if (initial && path === initialPath) return <>{initial}</>;
    const page = resolveBrowseRoute(path, browseRoutesFor(variant));
    return <div key={path} className="contents">{page ?? fallback?.(path) ?? null}</div>;
};
