import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Memberships",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2185**. Memberships — quiet empty state." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="memberships" /> };
