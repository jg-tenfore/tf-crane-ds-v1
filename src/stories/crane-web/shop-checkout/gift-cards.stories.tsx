import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckoutPage, GIFT_EMAIL_ORDER, GIFT_ORDER_IDS, GIFT_PRINT_ORDER, GIFT_SELF_ORDER, giftLine } from "@/screens/web/checkout";
import { CraneWebRoutes, webRoutes, type WebRoute } from "@/screens/web/web-app";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Prototypes/Crane Web/Shop/Gift Card Checkout",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "The Nov 25 gift card flow (Fox **Reviews › Nov 25 – Gift Cards**) through Crane Web's own **Cart → Checkout → Confirmation**, the purchase email and the Wallet. " +
                    "A gift card checks out on its own (cart kind `gift-card`): no Ship to, shipping, address or tax step, and no discount codes, rewards or gift-card payment. " +
                    "**Cart:** the card art, \"$60 Sagamore Spring gift card\", design · delivery, the green deal line, **Edit** (back to the builder with every choice) and Remove; Deal bonus, Delivery — email Free, Taxes $0.00. " +
                    "**Checkout:** **Send to** (collapsible: message, \"Their phone … · we'll text them the card too\", From) and **Delivery** in place of Ship to and Shipping; signed out, Contact becomes the sign-in step (`/sign-in?next=/checkout`) and the cart is kept. " +
                    "**Confirmation:** Gift card details in place of Returns, **View the email** (`/order/<id>/email`), See your gift cards (`/account/wallet?bought=<id>`), confetti. " +
                    "**Emails:** Self Email with the Gift Card ID right above a scannable UPC-A barcode (barcode only, no QR); Gift Email with no code. **Wallet:** the notice, a New card or the gift on top of Sent as gifts. " +
                    "Every story runs on the app's router, so Checkout, Pay now, the email and the wallet links all click through.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const ROUTES = webRoutes();
/** The app's routes, with one path rendered with story props (first match wins). */
const withPage = (pattern: string, page: ReactNode): WebRoute[] => [{ pattern, render: () => page }, ...ROUTES];
const App = ({ routes = ROUTES }: { routes?: WebRoute[] }) => <CraneWebRoutes routes={routes} />;

const giftCart = () => [giftLine(GIFT_EMAIL_ORDER)];
const selfCart = () => [giftLine(GIFT_SELF_ORDER)];

/* ---------- Cart ---------- */

export const Cart: Story = {
    render: () => (
        <WebScreen path="/cart" cart={giftCart()}>
            <App />
        </WebScreen>
    ),
};

export const CartMobileWeb: Story = {
    name: "Cart · Mobile web",
    render: () => (
        <WebScreen path="/cart" width="mobile" cart={giftCart()}>
            <App />
        </WebScreen>
    ),
};

/* ---------- Checkout ---------- */

export const Checkout: Story = {
    name: "Checkout",
    render: () => (
        <WebScreen path="/checkout" cart={giftCart()}>
            <App routes={withPage("/checkout", <CheckoutPage sendToOpen />)} />
        </WebScreen>
    ),
};

export const CheckoutForMe: Story = {
    name: "Checkout · for me",
    render: () => (
        <WebScreen path="/checkout" cart={selfCart()}>
            <App />
        </WebScreen>
    ),
};

/** Signed out: Contact is the sign-in step. Sign in goes to /sign-in?next=/checkout and comes back with the cart kept. */
export const CheckoutSignedOut: Story = {
    name: "Checkout · signed out",
    render: () => (
        <WebScreen path="/checkout" cart={giftCart()} signedIn={false}>
            <App />
        </WebScreen>
    ),
};

/* ---------- Confirmation ---------- */

export const ConfirmationGift: Story = {
    name: "Confirmation (gift)",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.email}`}>
            <App />
        </WebScreen>
    ),
};

export const ConfirmationPrint: Story = {
    name: "Confirmation (print)",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.print}`}>
            <App />
        </WebScreen>
    ),
};

export const ConfirmationForMe: Story = {
    name: "Confirmation (for me)",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.self}`}>
            <App />
        </WebScreen>
    ),
};

export const ConfirmationMobileWeb: Story = {
    name: "Confirmation · Mobile web",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.email}`} width="mobile">
            <App />
        </WebScreen>
    ),
};

/* ---------- Purchase emails ---------- */

/** Bought for yourself: the card with the full code, then the Gift Card ID and its scannable barcode. */
export const SelfEmail: Story = {
    name: "Self email",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.self}/email`}>
            <App />
        </WebScreen>
    ),
};

/** The buyer's copy of a gift by email (with the recipient's phone): no code or barcode. */
export const GiftEmail: Story = {
    name: "Gift email (email)",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.email}/email`}>
            <App />
        </WebScreen>
    ),
};

export const GiftEmailPrint: Story = {
    name: "Gift email (print)",
    render: () => (
        <WebScreen path={`/order/${GIFT_ORDER_IDS.print}/email`}>
            <App />
        </WebScreen>
    ),
};

/* ---------- Wallet ---------- */

export const WalletGiftSent: Story = {
    name: "Wallet · gift sent",
    render: () => (
        <WebScreen path={`/account/wallet?bought=${GIFT_ORDER_IDS.email}`}>
            <App />
        </WebScreen>
    ),
};

export const WalletForMe: Story = {
    name: "Wallet · for me",
    render: () => (
        <WebScreen path={`/account/wallet?bought=${GIFT_ORDER_IDS.self}`}>
            <App />
        </WebScreen>
    ),
};

/* ---------- Dark ---------- */

export const CheckoutDark: Story = {
    name: "Dark · Checkout",
    render: () => (
        <WebScreen path="/checkout" cart={[giftLine(GIFT_PRINT_ORDER)]} dark>
            <App />
        </WebScreen>
    ),
};
