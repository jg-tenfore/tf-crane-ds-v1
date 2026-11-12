import type { ReactNode } from "react";
import { matchPath } from "@/components/web/web-router";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import type { WebWidth } from "@/components/web/web-frame";
import type { CartLine } from "@/screens/web/cart-store";
import { BrowseOutlet, type CategoryNavVariant } from "@/screens/web/browse";
import { checkoutRoutes } from "@/screens/web/checkout";
import { WebShell } from "@/screens/web/web-shell";
import { WebScreen } from "../web-story-kit";

/** Paths outside the shop: hand off to the Cart/Checkout routes, else a stub page. */
const otherArea = (path: string) => {
    for (const r of checkoutRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return r.render(params);
    }
    return (
        <WebShell>
            <WebPage>
                <PageHeader title="Not in this prototype" subtitle={`${path} belongs to another Crane Web area.`} />
            </WebPage>
        </WebShell>
    );
};

/**
 * One shop screen in the browser frame. The explicit-props screen shows first; clicking any
 * link routes through the browse routes (same nav variant), so every story is clickable.
 */
export const ShopStory = ({ path, width, cart, variant = "tabs", height, children }: { path: string; width?: WebWidth; cart?: CartLine[]; variant?: CategoryNavVariant; height?: number; children: ReactNode }) => (
    <WebScreen path={path} width={width} cart={cart} height={height}>
        <BrowseOutlet variant={variant} initial={children} initialPath={path} fallback={otherArea} />
    </WebScreen>
);
