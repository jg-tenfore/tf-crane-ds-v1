import { packageById, subscriptionById } from "./data";
import { CreditsPage, MonthlyPlansPage, PackCheckoutPage, PackDetailPage, PackPurchasedPage, PackagesPage, PlanDetailPage, type Purchase } from "./packages";
import type { InstructionRoute } from "./route-types";
import { useInstructionQuery } from "./use-instruction-query";

/**
 * `/instruction/packages` — one route, every state in the URL:
 *   (none)                       the catalog; `?lessons=5|10` filters, `?coach=<id>` scopes to one instructor
 *   `?step=plans`                monthly plans (concept)
 *   `?pack=<pack id>`            pack detail → `&step=checkout` → `&step=done` (buys it into the store)
 *   `?pack=<plan id>`            plan detail (`&date=<iso>` start, `&renew=0`) → `&step=checkout` → `&step=done`
 * An unknown `pack` falls back to the catalog.
 */
const PackagesRoute = () => {
    const { query } = useInstructionQuery();
    if (query.pack) {
        const pack = packageById(query.pack);
        const plan = pack ? undefined : subscriptionById(query.pack);
        const purchase: Purchase | undefined = pack ? { kind: "pack", pack } : plan ? { kind: "plan", plan } : undefined;
        // Assigned packs (Thrive imports) are never for sale: only their detail renders.
        if (purchase && !(purchase.kind === "pack" && purchase.pack.availability === "assigned" && query.step)) {
            if (query.step === "checkout") return <PackCheckoutPage purchase={purchase} />;
            if (query.step === "done") return <PackPurchasedPage purchase={purchase} />;
            return purchase.kind === "pack" ? <PackDetailPage pack={purchase.pack} /> : <PlanDetailPage plan={purchase.plan} />;
        }
        if (purchase?.kind === "pack") return <PackDetailPage pack={purchase.pack} />;
    }
    if (query.step === "plans") return <MonthlyPlansPage />;
    return <PackagesPage />;
};

/**
 * Lesson packages + credits routes — OWNED BY THE PACKAGES SCREEN AGENT.
 *
 * - `/instruction/packages` — see `PackagesRoute` above.
 * - `/instruction/credits` — the golfer's balances from the session store (`?bought=<pack id>`
 *   highlights a fresh purchase; `?demo=after-booking|spent-expired|empty` are review states).
 */
export const packagesRoutes: InstructionRoute[] = [
    { pattern: "/instruction/packages", label: "Lesson packages", render: () => <PackagesRoute /> },
    { pattern: "/instruction/credits", label: "My lesson credits", render: () => <CreditsPage /> },
];
