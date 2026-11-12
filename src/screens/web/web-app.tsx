import { createElement, useEffect, useRef, type ReactNode } from "react";
import { Tool01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { useWebFrame } from "@/components/web/web-frame";
import { WEB_SECTIONS, type WebSection } from "@/components/web/web-header";
import { WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { accountRoutes, AccountMembershipsScreen } from "./account";
import { authRoutes } from "./auth";
import { browseRoutesFor, type CategoryNavVariant } from "./browse";
import { checkoutRoutes } from "./checkout";
import { eventRoutes } from "./events";
import { restaurantRoutes } from "./restaurant";
import { TeeTimeRoundsProvider, teeTimeRoutes } from "./tee-times";
import { WebShell } from "./web-shell";

export interface WebRoute {
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/** Placeholder for areas that aren't built yet, so every header link lands somewhere. */
const ComingSoon = ({ section }: { section?: WebSection }) => {
    const { navigate } = useWebRouter();
    const label = WEB_SECTIONS.find((s) => s.id === section)?.label ?? "This page";
    return (
        <WebShell active={section}>
            <WebPage>
                <EmptyState
                    variant="featured"
                    icon={Tool01}
                    title={`${label} is coming soon`}
                    description="This part of Crane Web is still being designed."
                    action={
                        <Button size="md" className="rounded-lg text-md" onPress={() => navigate("/shop")}>
                            Go to the Shop
                        </Button>
                    }
                    className="py-24"
                />
            </WebPage>
        </WebShell>
    );
};

/**
 * Every Crane Web route, most specific first (first match wins). Anything unmatched under a
 * section (an old or mistyped link) falls through to a friendly page via the catch-alls at the end.
 */
export const webRoutes = (opts: { shopNav?: CategoryNavVariant } = {}): WebRoute[] => [
    ...authRoutes,
    ...checkoutRoutes,
    // Membership "Join" links (shop Club Offerings + account plans) open the join page.
    // Before the shop routes, or /shop/:group/:subgroup? would claim /shop/memberships/<id>.
    { pattern: "/memberships/:id", render: () => <AccountMembershipsScreen memberships={[]} /> },
    { pattern: "/shop/memberships/:id", render: () => <AccountMembershipsScreen memberships={[]} /> },
    ...browseRoutesFor(opts.shopNav ?? "tabs"),
    ...restaurantRoutes,
    ...teeTimeRoutes,
    ...eventRoutes,
    ...accountRoutes.map((r) => ({ pattern: r.pattern, render: () => createElement(r.screen) })),
    ...WEB_SECTIONS.map((s) => ({ pattern: `${s.href}/:a?/:b?/:c?`, render: () => <ComingSoon section={s.id} /> })),
];

export const resolveWebRoute = (path: string, routes: WebRoute[]): ReactNode => {
    for (const r of routes) {
        const params = matchPath(r.pattern, path);
        if (params) return r.render(params);
    }
    return <ComingSoon />;
};

/**
 * CraneWebRoutes — renders the page for the current router path and scrolls to the top on
 * navigation. "/" goes to Tee Times, CraneWeb's home.
 */
export const CraneWebRoutes = ({ routes }: { routes: WebRoute[] }) => {
    const { path, navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        scrollToTop();
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    }, [path, scrollToTop]);
    useEffect(() => {
        if (path === "/" || path === "") navigate("/tee-times");
    }, [path, navigate]);
    // App-level stores that must survive navigation live here (rounds booked this session).
    return <TeeTimeRoundsProvider>{resolveWebRoute(path.split("#")[0], routes)}</TeeTimeRoundsProvider>;
};
