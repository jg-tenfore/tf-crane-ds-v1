import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { RestaurantPage } from "@/screens/web/restaurant";
import { WebScreen } from "../web-story-kit";

const PRO_SHOP = linesFrom([
    ["ball-titleist-pro-v1-dozen", "", 1],
    ["ball-taylormade-tp5-dozen", "", 1],
]);

const meta: Meta = {
    title: "Crane Web/Restaurant/Mixed Cart Dialog",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Food & drinks and pro shop items can't be checked out together (`useCart().add()` returns `{ ok: false, reason: \"mixed\" }`). Adding a menu item over a pro shop cart explains why and offers **View cart** (→ /cart) or **Clear cart and add**. Restaurant page chrome from Fox's Global Nav / Restaurant story.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const MixedCart: Story = {
    name: "Mixed cart dialog",
    render: () => (
        <WebScreen path="/restaurant" cart={PRO_SHOP}>
            <RestaurantPage mixedItemId="food-cheeseburger" />
        </WebScreen>
    ),
};

export const MixedCartMobile: Story = {
    name: "Mixed cart dialog (mobile web)",
    render: () => (
        <WebScreen path="/restaurant" cart={PRO_SHOP} width="mobile">
            <RestaurantPage mixedItemId="food-cheeseburger" />
        </WebScreen>
    ),
};

export const ProShopCartRail: Story = {
    name: "Pro shop cart (rail notice)",
    render: () => (
        <WebScreen path="/restaurant" cart={PRO_SHOP}>
            <RestaurantPage />
        </WebScreen>
    ),
};
