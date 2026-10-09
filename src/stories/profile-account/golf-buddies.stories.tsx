import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Golf Buddies",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Recreates **IMG_8581** (pending requests + my buddies) and the empty state **IMG_2184**. Remove asks for confirmation; **+** opens an invite sheet that adds a pending request.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="golf-buddies" /> };

export const Empty: Story = { render: () => <ProfileStack route="golf-buddies" params={{ buddies: [], requests: [] }} /> };

export const InviteSheet: Story = { name: "Invite sheet", render: () => <ProfileStack route="golf-buddies" params={{ defaultInviteOpen: true }} /> };
