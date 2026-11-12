import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShopHome } from "@/screens/web/browse";
import { ShopStory } from "./shop-story";

const meta: Meta = {
    title: "Crane Web/Shop/1. Shop",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "`/shop` — ports Fox **Global Nav / Pro Shop / Shop All** (`store-shop-all.stories.tsx`: Sort by · On sale · Price · In stock · Saved chips, item count, product cards) and the Club Offerings tiles from `card-tiles.tsx`, in the live CraneWeb layout: big Shop title, category navigation, Club Offerings (PURCHASE → / JOIN →), Featured, Shop all. Two category-navigation variants for review: **A Tabs** (CraneWeb today) and **B Sidebar** (Fox). Mobile web gets a sticky search + chip bar and a Categories sheet. Every link is live.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const DesktopTabs: Story = { name: "Desktop (tabs)", render: () => <ShopStory path="/shop"><ShopHome variant="tabs" /></ShopStory> };
export const DesktopSidebar: Story = { name: "Desktop (sidebar)", render: () => <ShopStory path="/shop" variant="sidebar"><ShopHome variant="sidebar" /></ShopStory> };
export const Laptop: Story = { render: () => <ShopStory path="/shop" width="laptop"><ShopHome /></ShopStory> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <ShopStory path="/shop" width="mobile"><ShopHome /></ShopStory> };
export const MobileWebCategoriesOpen: Story = {
    name: "Mobile web (categories open)",
    render: () => (
        <ShopStory path="/shop" width="mobile">
            <ShopHome initialCategoriesOpen />
        </ShopStory>
    ),
};
