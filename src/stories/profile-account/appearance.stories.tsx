import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppearanceScreen } from "@/screens/profile";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Appearance",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2190**. Appearance — System / Light / Warm Dark preview cards (React Aria RadioGroup). The mini previews are drawn with semantic tokens; the dark ones sit inside `.dark-mode`." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="appearance" /> };

export const LightSelected: Story = { name: "Light selected", render: () => <AppearanceScreen defaultMode="light" /> };
