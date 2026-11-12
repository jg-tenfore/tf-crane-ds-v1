import { createElement, type ReactNode } from "react";
import { AddMorePage } from "./add-more-page";
import { CartPage } from "./cart-page";
import { CheckoutPage } from "./checkout-page";
import { ConfirmationPage } from "./confirmation-page";

export { AddMorePage } from "./add-more-page";
export { CartPage, type CartPageProps } from "./cart-page";
export { CheckoutPage, type CheckoutPageProps } from "./checkout-page";
export { ConfirmationPage, type ConfirmationPageProps } from "./confirmation-page";
export { CheckoutFlow } from "./checkout-flow";
export { BIG_CART, DEMO_PROMO, FOOD_CART, MIXED_CART, RETAIL_CART, SAVED_ADDRESSES } from "./checkout-data";

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
];
