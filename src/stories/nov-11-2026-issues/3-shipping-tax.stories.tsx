import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { CheckoutPage, FOOD_CART, RETAIL_CART } from "@/screens/web/checkout";
import { WebScreen } from "../crane-web/web-story-kit";

const caption = (story: string) => ({ docs: { description: { story } } });

const meta: Meta = {
    title: "Nov 11, 2026 Issues/3. Shipping address & tax",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "**Issue:** checkout needs a normal shipping address field, so tax is charged where the item ships. Tax varies by state, county and city. " +
                    "**Status: designed in Crane Web; the tax service needs sizing.** Checkout asks **Ship** or **Pick up at the course**. Shipping uses a saved or new address, and the tax row names the " +
                    "destination (state + county + city) and recalculates when the address changes. Pickup is taxed where the course is. Food & drink orders are pickup-only. " +
                    "Same cart in every story. The rates are sample rates; real ones would come from a tax service.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const cart = () => linesFrom(RETAIL_CART);

/** Tall frames, so the Tax row in the order summary is in view without scrolling. */
const DESKTOP_H = 1300;
const MOBILE_H = 1700;

export const ShipToGA: Story = {
    name: "Ship to Athens, GA · 8.00%",
    parameters: caption("Shipping to Athens-Clarke County, GA. The tax row shows the destination and 8.00%."),
    render: () => (
        <WebScreen path="/checkout" cart={cart()} height={DESKTOP_H}>
            <CheckoutPage addressId="addr-ga" shipToOpen />
        </WebScreen>
    ),
};

export const ShipToMA: Story = {
    name: "Ship to Brookline, MA · 6.25%",
    parameters: caption("Same cart shipped to Brookline, Norfolk County, MA. Tax drops to 6.25%."),
    render: () => (
        <WebScreen path="/checkout" cart={cart()} height={DESKTOP_H}>
            <CheckoutPage addressId="addr-ma" shipToOpen />
        </WebScreen>
    ),
};

export const PickUpAtCourse: Story = {
    name: "Pick up at the course",
    parameters: caption("Pick up at the course: no shipping, and tax is charged where the course is (Lynnfield, Essex County, MA)."),
    render: () => (
        <WebScreen path="/checkout" cart={cart()} height={DESKTOP_H}>
            <CheckoutPage fulfillment="pickup" />
        </WebScreen>
    ),
};

export const NoAddressYet: Story = {
    name: "No address yet",
    parameters: caption("Before an address is chosen, tax reads \"Calculated after address\" instead of guessing."),
    render: () => (
        <WebScreen path="/checkout" cart={cart()} height={DESKTOP_H}>
            <CheckoutPage addressId={null} />
        </WebScreen>
    ),
};

export const AddAddress: Story = {
    name: "Add a shipping address",
    parameters: caption("A normal address form with suggestions as you type: street, apt, city, state and ZIP."),
    render: () => (
        <WebScreen path="/checkout" cart={cart()} height={DESKTOP_H}>
            <CheckoutPage addressModalOpen addressQuery="1 Lump" shipToOpen />
        </WebScreen>
    ),
};

export const FoodPickupOnly: Story = {
    name: "Food order · pickup only",
    parameters: caption("Food & drinks can't ship. A food order goes straight to pickup at the Grill, taxed at the course."),
    render: () => (
        <WebScreen path="/checkout" cart={linesFrom(FOOD_CART)} height={DESKTOP_H}>
            <CheckoutPage />
        </WebScreen>
    ),
};

export const MobileShipToGA: Story = {
    name: "Mobile web · ship to GA",
    parameters: caption("Mobile web checkout with the order summary open, so the destination tax row is visible."),
    render: () => (
        <WebScreen path="/checkout" width="mobile" cart={cart()} height={MOBILE_H}>
            <CheckoutPage addressId="addr-ga" summaryOpen />
        </WebScreen>
    ),
};

export const Compare: Story = {
    name: "Compare · GA vs MA vs pickup",
    parameters: caption("One cart, three destinations, side by side on mobile web. Read the Tax row in each order summary."),
    render: () => (
        <div className="grid grid-cols-3 items-start">
            <WebScreen path="/checkout" width="mobile" cart={cart()} height={MOBILE_H}>
                <CheckoutPage addressId="addr-ga" summaryOpen />
            </WebScreen>
            <WebScreen path="/checkout" width="mobile" cart={cart()} height={MOBILE_H}>
                <CheckoutPage addressId="addr-ma" summaryOpen />
            </WebScreen>
            <WebScreen path="/checkout" width="mobile" cart={cart()} height={MOBILE_H}>
                <CheckoutPage fulfillment="pickup" summaryOpen />
            </WebScreen>
        </div>
    ),
};
