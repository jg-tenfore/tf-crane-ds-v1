import type { Meta, StoryObj } from "@storybook/react-vite";
import { productById, SHOP_PRODUCTS, type ShopProduct } from "@/data/shop";
import { linesFrom } from "@/screens/web/cart-store";
import { ProductPage, ShopHome } from "@/screens/web/browse";
import { AddMorePage, CartPage, CheckoutPage, ConfirmationPage, MIXED_CART, RETAIL_CART } from "@/screens/web/checkout";
import { RestaurantPage } from "@/screens/web/restaurant";
import { ShopStory } from "../crane-web/shop/shop-story";
import { WebScreen } from "../crane-web/web-story-kit";

/** Published Fox Storybook, so each caption can link to the original layout. */
const FOX = "https://jg-tenfore.github.io/tf-fox-ds-v1/?path=/story/";
const fox = (label: string, id: string) => `[Fox › ${label}](${FOX}${id})`;

const caption = (story: string) => ({ docs: { description: { story } } });

const meta: Meta = {
    title: "Nov 11, 2026 Issues/1. Fox layouts reused",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "**Issue:** reuse Fox's web layouts, with their checkout flows and edge cases, instead of designing CraneWeb from scratch. " +
                    "**Status: built in Crane Web.** Every shop and checkout page below is a Fox layout, restyled in Crane (Outfit, Crane tokens) and wired to CraneWeb's routes. " +
                    "Each caption links to the Fox original. These are the real Crane Web screens, not new mockups.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const BALLS = productById("ball-titleist-pro-v1-dozen")!;
const soldOut = (p: ShopProduct) => !p.inStock || p.stock <= 0;
const SOLD_OUT = SHOP_PRODUCTS.find((p) => soldOut(p) && p.group === "apparel") ?? SHOP_PRODUCTS.find(soldOut)!;
const pathOf = (p: ShopProduct) => `/shop/${p.group}${p.subgroup ? `/${p.subgroup}` : ""}/${p.id}`;

export const ShopAll: Story = {
    name: "Shop all (Fox sidebar nav)",
    parameters: caption(`From ${fox("Pro Shop › Shop All", "global-nav-pro-shop-shop-all--default")}: filter chips, item count and product cards. The sidebar category nav is Fox's; CraneWeb's tab nav is the other variant.`),
    render: () => (
        <ShopStory path="/shop" variant="sidebar">
            <ShopHome variant="sidebar" />
        </ShopStory>
    ),
};

export const Product: Story = {
    parameters: caption(`From ${fox("Pro Shop › Product", "global-nav-pro-shop-product--default")}: gallery, rating, price, description and reviews. CraneWeb adds stock count, pack chips and a quantity stepper.`),
    render: () => (
        <ShopStory path={pathOf(BALLS)}>
            <ProductPage productId={BALLS.id} />
        </ShopStory>
    ),
};

export const ProductSoldOut: Story = {
    name: "Product · sold out (edge case)",
    parameters: caption(`Fox edge case kept: ${fox("Product — Sold Out", "global-nav-pro-shop-product--sold-out")}, with Notify me.`),
    render: () => (
        <ShopStory path={pathOf(SOLD_OUT)}>
            <ProductPage productId={SOLD_OUT.id} />
        </ShopStory>
    ),
};

export const Cart: Story = {
    parameters: caption(`From ${fox("Shop Checkout › 1. Cart", "shop-checkout-1-cart--default")}: line items with steppers, then the order summary with promo field and totals.`),
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(RETAIL_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

export const CartMixed: Story = {
    name: "Cart · food + pro shop (edge case)",
    parameters: caption("CraneWeb rule on the Fox cart: food & drinks and pro shop items check out separately, so a mixed cart explains what to do."),
    render: () => (
        <WebScreen path="/cart" cart={linesFrom(MIXED_CART)}>
            <CartPage />
        </WebScreen>
    ),
};

export const AddMore: Story = {
    name: "Add more",
    parameters: caption(`From ${fox("Shop Checkout › 2. Add More", "shop-checkout-2-add-more--default")}: recommendations and the free-shipping progress bar.`),
    render: () => (
        <WebScreen path="/cart/add-more" cart={linesFrom(RETAIL_CART)}>
            <AddMorePage />
        </WebScreen>
    ),
};

export const Checkout: Story = {
    parameters: caption(`From ${fox("Shop Checkout › 3. Checkout", "shop-checkout-3-checkout--default")}: contact, ship to, plan, payment and order summary. CraneWeb adds Ship vs Pick up and destination tax (see issue 3).`),
    render: () => (
        <WebScreen path="/checkout" cart={linesFrom(RETAIL_CART)}>
            <CheckoutPage addressId="addr-ma" />
        </WebScreen>
    ),
};

export const PaymentMethods: Story = {
    name: "Checkout · payment methods (edge case)",
    parameters: caption("Fox's payment edge cases kept: saved cards, an expired card with Delete, and Pay another way."),
    render: () => (
        <WebScreen path="/checkout" cart={linesFrom(RETAIL_CART)}>
            <CheckoutPage paymentModalOpen />
        </WebScreen>
    ),
};

export const Confirmation: Story = {
    parameters: caption(`From ${fox("Shop Checkout › 4. Confirmation - Purchase", "shop-checkout-4-confirmation-purchase--default")}: order number, items, delivery and payment, with the destination tax line on the receipt.`),
    render: () => (
        <WebScreen path="/order/SG-100482">
            <ConfirmationPage orderId="SG-100482" />
        </WebScreen>
    ),
};

export const Restaurant: Story = {
    parameters: caption(`From ${fox("Global Nav › Restaurant", "global-nav-restaurant--today")}: order ahead for pickup at the Grill. Food is pickup-only.`),
    render: () => (
        <WebScreen path="/restaurant">
            <RestaurantPage />
        </WebScreen>
    ),
};
