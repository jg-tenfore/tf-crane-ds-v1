import type { Meta, StoryObj } from "@storybook/react-vite";
import { BUDDIES } from "@/data/crane";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Golf Buddies",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2184** (empty state) and adds a populated list built from `BUDDIES`." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { name: "Empty", render: () => <ProfileStack route="golf-buddies" /> };

export const WithBuddies: Story = { name: "With buddies", render: () => <ProfileStack route="golf-buddies" params={{ buddies: BUDDIES }} /> };
