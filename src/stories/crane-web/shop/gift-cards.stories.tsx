import type { Meta, StoryObj } from "@storybook/react-vite";
import { GiftCardPage, PunchCardPage } from "@/screens/web/browse";
import { ShopStory } from "./shop-story";

const meta: Meta = {
    title: "Crane Web/Shop/Gift Cards",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "`/shop/gift-cards` and `/shop/punch-cards` — port Fox **Global Nav / Pro Shop / Cards** (`proshop-cards.stories.tsx`): card preview + design/pack rail, amount chips with a custom amount ($25–$500), email-a-recipient vs add-to-my-balance, message, Add to cart; the punch card shows per-round savings and your active card.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <ShopStory path="/shop/gift-cards"><GiftCardPage /></ShopStory> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <ShopStory path="/shop/gift-cards" width="mobile"><GiftCardPage initialRecipient={{ name: "Jane", email: "jane@tenfore.golf" }} /></ShopStory> };
export const PunchCard: Story = { name: "Punch card", render: () => <ShopStory path="/shop/punch-cards"><PunchCardPage /></ShopStory> };
export const PunchCardMobile: Story = { name: "Punch card (mobile web)", render: () => <ShopStory path="/shop/punch-cards" width="mobile"><PunchCardPage /></ShopStory> };
