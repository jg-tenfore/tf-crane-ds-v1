import { createElement, type ReactNode } from "react";
import { AddMorePage } from "./add-more-page";
import { CartPage } from "./cart-page";
import { CheckoutPage } from "./checkout-page";
import { ConfirmationPage } from "./confirmation-page";
import { OrderEmailPage } from "./order-email-page";

export { AddMorePage } from "./add-more-page";
export { CartPage, type CartPageProps } from "./cart-page";
export { CheckoutPage, type CheckoutPageProps } from "./checkout-page";
export { ConfirmationPage, orderEmailPath, walletBoughtPath, type ConfirmationPageProps } from "./confirmation-page";
export { OrderEmailPage, type OrderEmailPageProps } from "./order-email-page";
export { CheckoutFlow } from "./checkout-flow";
export { BIG_CART, DEMO_PROMO, FOOD_CART, GIFT_EMAIL_ORDER, GIFT_PRINT_ORDER, GIFT_SELF_ORDER, giftLine, MIXED_CART, RETAIL_CART, SAVED_ADDRESSES } from "./checkout-data";
export { GIFT_ORDER_IDS, orderById, type PlacedOrder } from "./orders";

export interface CheckoutRoute {
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/**
 * Cart → Add more → Checkout → Confirmation. Match with `matchPath(pattern, path)`.
 * Place order calls `navigate("/order/<id>")` and clears the cart; Checkout → "/checkout";
 * Continue shopping → "/shop".
 */
export const checkoutRoutes: CheckoutRoute[] = [
    { pattern: "/cart", render: () => createElement(CartPage) },
    { pattern: "/cart/add-more", render: () => createElement(AddMorePage) },
    { pattern: "/checkout", render: () => createElement(CheckoutPage) },
    { pattern: "/order/:orderId", render: ({ orderId }) => createElement(ConfirmationPage, { key: orderId, orderId }) },
    // Gift card orders: the purchase email ("View the email" on the confirmation).
    { pattern: "/order/:orderId/email", render: ({ orderId }) => createElement(OrderEmailPage, { key: orderId, orderId }) },
];
