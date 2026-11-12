import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryPage } from "@/screens/web/browse";
import { ShopStory } from "./shop-story";

const meta: Meta = {
    title: "Crane Web/Shop/2. Category",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "`/shop/:group` and `/shop/:group/:subgroup` — the category level of Fox **Global Nav / Pro Shop / Shop All** (`store-shop-all.stories.tsx`), with groups and subgroups read from `SHOP_GROUPS`. **Tabs** = CraneWeb's category + subgroup CapsTabs; **Sidebar** = Fox-style accordion with breadcrumb (Shop › Golf Balls › Dozens). Filters, \"N items\", paging, empty and not-found states.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Tabs: Story = { render: () => <ShopStory path="/shop/golf-balls"><CategoryPage group="golf-balls" variant="tabs" /></ShopStory> };
export const Sidebar: Story = { render: () => <ShopStory path="/shop/golf-balls" variant="sidebar"><CategoryPage group="golf-balls" variant="sidebar" /></ShopStory> };
export const SubgroupSelected: Story = {
    name: "Subgroup selected",
    render: () => (
        <ShopStory path="/shop/golf-balls/dozens">
            <CategoryPage group="golf-balls" subgroup="dozens" variant="tabs" />
        </ShopStory>
    ),
};
export const SubgroupSelectedSidebar: Story = {
    name: "Subgroup selected (sidebar)",
    render: () => (
        <ShopStory path="/shop/golf-balls/dozens" variant="sidebar">
            <CategoryPage group="golf-balls" subgroup="dozens" variant="sidebar" />
        </ShopStory>
    ),
};
export const Empty: Story = {
    name: "Empty",
    render: () => (
        <ShopStory path="/shop/golf-balls/dozens">
            <CategoryPage group="golf-balls" subgroup="dozens" initialFilters={{ onSale: true, price: "200p" }} />
        </ShopStory>
    ),
};
export const MobileWebSearch: Story = {
    name: "Mobile web (search active)",
    render: () => (
        <ShopStory path="/shop/golf-balls" width="mobile">
            <CategoryPage group="golf-balls" initialQuery="titleist" />
        </ShopStory>
    ),
};
