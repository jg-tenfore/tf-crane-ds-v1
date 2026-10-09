import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Gift Cards",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_8577** (balance, code and spend categories; expired cards are dimmed) and the empty state **IMG_2189**. The references were captured in Warm Dark — flip the toolbar Theme to compare." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="gift-cards" /> };

export const Empty: Story = { render: () => <ProfileStack route="gift-cards" params={{ cards: [] }} /> };
