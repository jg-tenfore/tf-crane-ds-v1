import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Memberships",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_8578** (member ID and expiry, flagged Expiring Soon inside 30 days) and the empty state **IMG_2185**. The references were captured in Warm Dark — flip the toolbar Theme to compare." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="memberships" /> };

export const Empty: Story = { render: () => <ProfileStack route="memberships" params={{ memberships: [] }} /> };
