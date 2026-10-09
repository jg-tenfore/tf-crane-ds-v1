import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Rain Checks",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_8576** (remaining balance per check, with Used Up / Active status) and the empty state **IMG_2188**. The references were captured in Warm Dark — flip the toolbar Theme to compare." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="rain-checks" /> };

export const Empty: Story = { render: () => <ProfileStack route="rain-checks" params={{ checks: [] }} /> };
