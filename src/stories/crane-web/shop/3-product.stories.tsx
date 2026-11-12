import type { Meta, StoryObj } from "@storybook/react-vite";
import { productsIn, SHOP_PRODUCTS, type ShopProduct } from "@/data/shop";
import { linesFrom } from "@/screens/web/cart-store";
import { ProductPage } from "@/screens/web/browse";
import { GALLERY_SHOE_ID } from "@/screens/web/browse/product-page";
import { ShopStory } from "./shop-story";

const meta: Meta = {
    title: "Crane Web/Shop/3. Product",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "`/shop/:group/:subgroup/:productId` — ports Fox **Global Nav / Pro Shop / Product** (`store-product.stories.tsx`: gallery + lightbox, brand, rating, price/sale, sold-out notify, Save/Share, description, reviews) and adds CraneWeb's \"In stock: N\", size chips (apparel/shoes), pack chips (golf-ball dozen ↔ sleeve SKUs), a qty stepper, Add to cart with inline confirmation, and the **food & drinks vs pro shop items check out separately** dialog.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const soldOut = (p: ShopProduct) => !p.inStock || p.stock <= 0;
const pathOf = (p: ShopProduct) => `/shop/${p.group}${p.subgroup ? `/${p.subgroup}` : ""}/${p.id}`;

const DEFAULT = SHOP_PRODUCTS.find((p) => p.id === GALLERY_SHOE_ID) ?? SHOP_PRODUCTS[0];
const ON_SALE = SHOP_PRODUCTS.find((p) => p.onSale && p.group === "apparel" && !soldOut(p)) ?? SHOP_PRODUCTS.find((p) => p.onSale)!;
const SOLD_OUT = SHOP_PRODUCTS.find((p) => soldOut(p) && p.group === "apparel") ?? SHOP_PRODUCTS.find(soldOut)!;
const FOOD = productsIn("snack-bar").find((p) => !soldOut(p) && /burger/i.test(p.title)) ?? productsIn("snack-bar").find((p) => !soldOut(p))!;
const BALLS = SHOP_PRODUCTS.find((p) => p.id === "ball-titleist-pro-v1-dozen") ?? productsIn("golf-balls").find((p) => !soldOut(p))!;
const FOOD_LINES = productsIn("snack-bar")
    .filter((p) => !soldOut(p))
    .slice(0, 2);

export const Default: Story = { render: () => <ShopStory path={pathOf(DEFAULT)}><ProductPage productId={DEFAULT.id} /></ShopStory> };
export const OnSale: Story = { name: "On sale", render: () => <ShopStory path={pathOf(ON_SALE)}><ProductPage productId={ON_SALE.id} /></ShopStory> };
export const SoldOut: Story = { name: "Sold out", render: () => <ShopStory path={pathOf(SOLD_OUT)}><ProductPage productId={SOLD_OUT.id} /></ShopStory> };
export const FoodItem: Story = { name: "Food item", render: () => <ShopStory path={pathOf(FOOD)}><ProductPage productId={FOOD.id} /></ShopStory> };
export const AddedToCart: Story = {
    name: "Added to cart",
    render: () => (
        <ShopStory path={pathOf(BALLS)} cart={linesFrom([[BALLS.id, "", 2]])}>
            <ProductPage productId={BALLS.id} initialQty={2} initialAdded />
        </ShopStory>
    ),
};
export const MixedCartDialog: Story = {
    name: "Mixed-cart dialog open",
    render: () => (
        <ShopStory path={pathOf(BALLS)} cart={linesFrom(FOOD_LINES.map((p) => [p.id, "", 1]))}>
            <ProductPage productId={BALLS.id} initialMixedOpen />
        </ShopStory>
    ),
};
export const MobileWeb: Story = { name: "Mobile web", render: () => <ShopStory path={pathOf(DEFAULT)} width="mobile"><ProductPage productId={DEFAULT.id} /></ShopStory> };
