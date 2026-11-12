import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountOverviewScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Overview",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Overview** (`profile-∕-account-overview--default`): the left \"My Profile\" side nav with Fox's 6 buckets + Memberships pinned + Sign out, a welcome line, at-a-glance stats (Handicap, Balance, Upcoming, Punch cards), the Upcoming list and the Golf Buddies connect module. Filled with Crane data: the Sagamore Hampton tee time, registered events, the expiring \"30 Day booking window\" membership and the Green Fees punch card. Mobile web swaps the side nav for a CapsTabs row.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/account"><AccountOverviewScreen /></WebScreen> };
export const Laptop: Story = { render: () => <WebScreen path="/account" width="laptop"><AccountOverviewScreen /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/account" width="mobile"><AccountOverviewScreen /></WebScreen> };
export const NonMember: Story = {
    name: "Non-member",
    parameters: { docs: { description: { story: "Fox **Overview (Non-member)**: no active membership, so the join banner sits above the stats." } } },
    render: () => <WebScreen path="/account"><AccountOverviewScreen memberships={[]} /></WebScreen>,
};
