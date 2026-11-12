import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { useCart } from "@/screens/web/cart-store";
import { restaurantRoutes } from "@/screens/web/restaurant";
import { WebShell } from "@/screens/web/web-shell";
import { WebScreen } from "../web-story-kit";

/** Stand-in for pages owned by other Crane Web areas (/cart, /shop…). */
const OutsideRestaurant = ({ path }: { path: string }) => {
    const { navigate } = useWebRouter();
    const cart = useCart();
    return (
        <WebShell>
            <WebPage width="content">
                <PageHeader eyebrow="Leaves the restaurant flow" title={path.split("?")[0]} subtitle={`${cart.count} items in the cart.`} />
                <Panel className="mt-8" bodyClassName="flex flex-col gap-4 p-6 @tablet:flex-row @tablet:items-center">
                    <p className="flex-1 text-md text-tertiary">This page belongs to another Crane Web area (cart &amp; checkout). In the full prototype the lead&rsquo;s router renders it here.</p>
                    <Button iconLeading={ArrowLeft} size="md" className="h-10 rounded-lg text-sm" onPress={() => navigate("/restaurant")}>
                        Back to the menu
                    </Button>
                </Panel>
            </WebPage>
        </WebShell>
    );
};

/** A tiny route switch over `restaurantRoutes`. */
const RestaurantFlow = () => {
    const { path } = useWebRouter();
    for (const r of restaurantRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return <div key={r.pattern} className="contents">{r.render(params)}</div>;
    }
    return <OutsideRestaurant path={path} />;
};

const meta: Meta = {
    title: "Crane Web/Restaurant/Flow",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Clickable restaurant flow over `restaurantRoutes` (ports Fox's Global Nav / Restaurant Today / Tomorrow stories as one flow). Switch Today / Tomorrow, change the pickup time (ASAP · time slot · at the turn with a hole), browse sections (/restaurant/:subgroup), search, open an item, pick modifiers and Add; the order rail (desktop) or View order bar (mobile web) updates, and Checkout goes to /cart.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Flow: Story = {
    render: () => (
        <WebScreen path="/restaurant">
            <RestaurantFlow />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/restaurant" width="mobile">
            <RestaurantFlow />
        </WebScreen>
    ),
};
