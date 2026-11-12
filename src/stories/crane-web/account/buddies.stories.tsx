import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountBuddiesScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Golf Buddies",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Golf Buddies** (`profile-∕-account-golf-buddies--default`) with the Crane app's buddy data: pending invites (Waiting for response · Cancel), accepted buddies with handicaps, an Invite dialog and a Remove confirmation. Buddies without a name show their email, like the app.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const path = "/account/buddies";
export const Desktop: Story = { render: () => <WebScreen path={path}><AccountBuddiesScreen /></WebScreen> };
export const Invite: Story = { render: () => <WebScreen path={path}><AccountBuddiesScreen defaultInviteOpen /></WebScreen> };
export const Empty: Story = { render: () => <WebScreen path={path}><AccountBuddiesScreen buddies={[]} requests={[]} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountBuddiesScreen /></WebScreen> };
