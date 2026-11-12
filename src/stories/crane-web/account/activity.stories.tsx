import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountActivityScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Activity",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Activity** (`profile-∕-account-activity--default`): reservations and purchase history, here as Upcoming / Past / Purchases tabs of link rows. Tabs are deep links (`?tab=past`), and each order opens its receipt at `/account/activity/orders/:order`.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/account/activity"><AccountActivityScreen /></WebScreen> };
export const Past: Story = { render: () => <WebScreen path="/account/activity?tab=past"><AccountActivityScreen /></WebScreen> };
export const Purchases: Story = { render: () => <WebScreen path="/account/activity?tab=purchases"><AccountActivityScreen /></WebScreen> };
export const Receipt: Story = { render: () => <WebScreen path="/account/activity/orders/4243305"><AccountActivityScreen /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/account/activity" width="mobile"><AccountActivityScreen /></WebScreen> };
export const MobilePurchases: Story = { name: "Purchases · Mobile web", render: () => <WebScreen path="/account/activity?tab=purchases" width="mobile"><AccountActivityScreen /></WebScreen> };
