import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { CartPage, CheckoutFlow, DEMO_PROMO, FOOD_CART, MIXED_CART, RETAIL_CART } from "@/screens/web/checkout";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Shop/4. Cart",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Shop Checkout / 1. Cart** (two columns: line items with quantity steppers and Remove, then an order summary with a promo / gift-card field and totals). " +
                    "**CraneWeb adds:** the live cart's look (← Continue Shopping, YOUR ORDER eyebrow, Clear cart, PROMO CODE, green total, \"Payment method and final total are confirmed at checkout.\"), " +
                    "**Taxes · Fees · Surcharge** rows (fees 3%, surcharge 3.35%, each with a help tooltip; tax waits for checkout because it depends on where the order goes), " +
                    "a free-shipping progress bar that links to Add More, the **food & drinks check out separately** rule for mixed carts, pickup-only food carts, an empty state, and a sticky Checkout bar on mobile web.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
    name: "Default (3 retail items)",
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(RETAIL_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

export const PromoApplied: Story = {
    name: "Promo applied",
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(RETAIL_CART)}>
            <CartPage promo={DEMO_PROMO} />
        </WebScreen>
    ),
};

export const FoodOrder: Story = {
    name: "Food order",
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(FOOD_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

export const MixedCart: Story = {
    name: "Mixed cart notice",
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(MIXED_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

export const Empty: Story = {
    render: () => (
        <WebScreen path="/cart">
            <CartPage />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/cart" width="mobile" cart={linesFrom(RETAIL_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

/** Self-contained click-through: Checkout → Pay now → Confirmation (the app-wide Flow also covers /shop). */
export const ClickThrough: Story = {
    name: "Click-through (cart → confirmation)",
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(RETAIL_CART)}>
            <CheckoutFlow />
        </WebScreen>
    ),
};
