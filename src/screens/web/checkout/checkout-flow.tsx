import { Fragment } from "react";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { AddMorePage } from "./add-more-page";
import { CartPage } from "./cart-page";
import { CheckoutPage } from "./checkout-page";
import { ConfirmationPage } from "./confirmation-page";

/**
 * Renders the checkout page for the router's current path — a self-contained click-through
 * (Cart → Checkout → Place order → Confirmation). Paths outside checkout (e.g. /shop) show a
 * small placeholder; the full app Flow handles those.
 */
export const CheckoutFlow = () => {
    const { path, navigate } = useWebRouter();
    let page;
    if (matchPath("/cart/add-more", path)) page = <AddMorePage />;
    else if (matchPath("/cart", path)) page = <CartPage />;
    else if (matchPath("/checkout", path)) page = <CheckoutPage />;
    else {
        const order = matchPath("/order/:orderId", path);
        page = order ? (
            <ConfirmationPage orderId={order.orderId} />
        ) : (
            <div className="flex min-h-[600px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-md text-tertiary">
                    <code className="rounded bg-tertiary px-1.5 py-0.5 text-sm">{path}</code> lives in the shop stories.
                </p>
                <button type="button" onClick={() => navigate("/cart")} className="text-md font-semibold text-brand-secondary underline">
                    Back to cart
                </button>
            </div>
        );
    }
    // Key by path so each route mounts fresh (initial state, scroll).
    return <Fragment key={path}>{page}</Fragment>;
};
