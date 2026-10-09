import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Edit Profile",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2179**. Edit Profile — First / Last Name, Email and Phone in icon TextFields. “Save Changes” is disabled until a field changes; saving pops back to Profile." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="edit-profile" /> };
