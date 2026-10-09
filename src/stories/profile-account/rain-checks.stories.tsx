import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Rain Checks",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2188**. Rain Checks — quiet empty state." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="rain-checks" /> };
