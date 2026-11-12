import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { AddMorePage, BIG_CART, RETAIL_CART } from "@/screens/web/checkout";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Shop/5. Add More",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Shop Checkout / 2. Add More**: a \"you might also like\" grid between cart and checkout, a running cart and the free-shipping progress bar (Fox `ShipProgress`), Continue to checkout / Back to cart. " +
                    "**CraneWeb adds:** picks are queried from the live catalog (in stock, same kind as the cart, spread across groups), cards confirm \"Added\", and on mobile web the progress bar sits at the top with a sticky Continue bar.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <WebScreen path="/cart/add-more" cart={linesFrom(RETAIL_CART)}>
            <AddMorePage />
        </WebScreen>
    ),
};

export const FreeShippingUnlocked: Story = {
    name: "Free shipping unlocked",
    render: () => (
        <WebScreen path="/cart/add-more" cart={linesFrom(BIG_CART)}>
            <AddMorePage />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/cart/add-more" width="mobile" cart={linesFrom(RETAIL_CART)}>
            <AddMorePage />
        </WebScreen>
    ),
};
