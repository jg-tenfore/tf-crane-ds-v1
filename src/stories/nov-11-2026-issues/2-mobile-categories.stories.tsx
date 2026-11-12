import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryPage, ShopHome } from "@/screens/web/browse";
import { RestaurantPage } from "@/screens/web/restaurant";
import { ShopStory } from "../crane-web/shop/shop-story";
import { WebScreen } from "../crane-web/web-story-kit";

const caption = (story: string) => ({ docs: { description: { story } } });

const meta: Meta = {
    title: "Nov 11, 2026 Issues/2. Mobile categories & search",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "**Issue:** on mobile there's no way to browse by category. It needs a menu at the top, or a search. " +
                    "**Status: built in Crane Web.** Below 768px the shop has a sticky bar under the header: a search field, a **Categories** button that opens every group and subgroup, " +
                    "and a row of category chips. The Restaurant menu works the same way. All stories are mobile web (390).",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const ShopBar: Story = {
    name: "Shop · search + categories bar",
    parameters: caption("The sticky bar at the top of the mobile shop: search, a Categories button, and chips for each group."),
    render: () => (
        <ShopStory path="/shop" width="mobile">
            <ShopHome />
        </ShopStory>
    ),
};

export const CategoriesMenu: Story = {
    name: "Categories menu open",
    parameters: caption("Tap Categories: every group and subgroup with item counts, plus Club Offerings. Each row is a deep link."),
    render: () => (
        <ShopStory path="/shop" width="mobile">
            <ShopHome initialCategoriesOpen />
        </ShopStory>
    ),
};

export const CategoriesMenuInCategory: Story = {
    name: "Categories menu · inside Golf Balls › Dozens",
    parameters: caption("Opened from a subgroup page, the menu checks where you are, so you can jump sideways."),
    render: () => (
        <ShopStory path="/shop/golf-balls/dozens" width="mobile">
            <CategoryPage group="golf-balls" subgroup="dozens" initialCategoriesOpen />
        </ShopStory>
    ),
};

export const SubgroupChips: Story = {
    name: "Category · subgroup chips",
    parameters: caption("Inside a group the chips switch to its subgroups (All Golf Balls · Dozens · Sleeves …), with a chip back to the whole shop."),
    render: () => (
        <ShopStory path="/shop/golf-balls" width="mobile">
            <CategoryPage group="golf-balls" />
        </ShopStory>
    ),
};

export const Search: Story = {
    name: "Search the whole shop",
    parameters: caption("Typing in the search field filters every product in the shop."),
    render: () => (
        <ShopStory path="/shop" width="mobile">
            <ShopHome initialQuery="titleist" />
        </ShopStory>
    ),
};

export const RestaurantMenu: Story = {
    name: "Restaurant · menu chips + search",
    parameters: caption("The Restaurant menu on mobile: a search field and sticky section chips. This one is opened on Beer & Seltzer."),
    render: () => (
        <WebScreen path="/restaurant/beer" width="mobile" height={1500}>
            <RestaurantPage />
        </WebScreen>
    ),
};
