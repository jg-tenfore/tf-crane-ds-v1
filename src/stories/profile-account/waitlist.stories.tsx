import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Waitlist",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2186**. Waitlist — “Join” glass pill in the nav bar and a featured empty state centred on screen." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="waitlist" /> };
