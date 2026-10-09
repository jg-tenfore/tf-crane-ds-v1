import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Punch Cards",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_8575** (one usage bar per punchable product) and the empty state **IMG_2187**. The references were captured in Warm Dark — flip the toolbar Theme to compare." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="punch-cards" /> };

export const Empty: Story = { render: () => <ProfileStack route="punch-cards" params={{ cards: [] }} /> };
