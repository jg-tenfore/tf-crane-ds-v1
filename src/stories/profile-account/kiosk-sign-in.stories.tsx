import type { Meta, StoryObj } from "@storybook/react-vite";
import { KioskSignInScreen } from "@/screens/profile";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Kiosk Sign-In",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2178**. Kiosk Sign-In — QR + monospace code on a white card. The pill counts down from 30s and a new code is issued at zero." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="kiosk-sign-in" /> };

export const FastExpiry: Story = { name: "Fast expiry (5s)", render: () => <KioskSignInScreen lifetime={5} /> };
