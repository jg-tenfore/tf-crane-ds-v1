import type { Meta, StoryObj } from "@storybook/react-vite";
import { linesFrom } from "@/screens/web/cart-store";
import { CheckoutPage, FOOD_CART, RETAIL_CART } from "@/screens/web/checkout";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Shop/6. Checkout",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Shop Checkout / 3. Checkout**: contact, collapsible Ship to (saved addresses + \"Use a different address\" → Add address), shipping, Plan (Pay now / Pay in installments, Prequalified), " +
                    "Payment (saved cards with brand logos, an expired card with Delete, \"Pay another way\" → Payment methods), and an order summary with rewards points, a discount field and totals. " +
                    "**CraneWeb adds (Nov 11 call):** **Ship** vs **Pick up at the course**; **destination tax** (state + county + city) that recalculates when the ship-to address changes — " +
                    "flip between the MA and GA saved addresses to watch it change; \"Calculated after address\" before one is chosen; an estimate + \"We'll confirm tax\" note for ZIPs we don't know; " +
                    "pickup taxed at the course; **food & drink orders are pickup only**; Fees + Surcharge rows; and on mobile web a \"Show order summary\" disclosure with a sticky Pay button.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const cart = () => linesFrom(RETAIL_CART);

export const ShipToMA: Story = {
    name: "Ship to MA",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage addressId="addr-ma" />
        </WebScreen>
    ),
};

export const ShipToGA: Story = {
    name: "Ship to GA (tax changes)",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage addressId="addr-ga" shipToOpen />
        </WebScreen>
    ),
};

export const NoAddressYet: Story = {
    name: "No address yet",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage addressId={null} />
        </WebScreen>
    ),
};

export const PickUp: Story = {
    name: "Pick up at course",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage fulfillment="pickup" />
        </WebScreen>
    ),
};

export const FoodOrder: Story = {
    name: "Food order (pickup only)",
    render: () => (
        <WebScreen path="/checkout" cart={linesFrom(FOOD_CART)}>
            <CheckoutPage />
        </WebScreen>
    ),
};

export const Installments: Story = {
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage plan="installments" promo="FALL20" rewardApplied />
        </WebScreen>
    ),
};

export const AddAddressModal: Story = {
    name: "Add address modal",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage addressModalOpen addressQuery="1 Lump" shipToOpen />
        </WebScreen>
    ),
};

export const PaymentMethodsModal: Story = {
    name: "Payment methods modal",
    render: () => (
        <WebScreen path="/checkout" cart={cart()}>
            <CheckoutPage paymentModalOpen />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/checkout" width="mobile" cart={cart()}>
            <CheckoutPage addressId="addr-ga" />
        </WebScreen>
    ),
};

export const MobileWebSummaryOpen: Story = {
    name: "Mobile web · summary open",
    render: () => (
        <WebScreen path="/checkout" width="mobile" cart={cart()}>
            <CheckoutPage addressId="addr-ga" summaryOpen />
        </WebScreen>
    ),
};
