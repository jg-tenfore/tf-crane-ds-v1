/**
 * Hands the cart's promo code to the next checkout render. Set when Checkout is pressed on the
 * Cart, read once by CheckoutPage on mount — so static stories never see a stale value.
 */
let carried: string | null = null;

export const carryPromo = (code: string | null) => {
    carried = code;
};

export const takeCarriedPromo = () => {
    const c = carried;
    carried = null;
    return c;
};
