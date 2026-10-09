import type { Meta, StoryObj } from "@storybook/react-vite";
import { PaymentMethodsScreen } from "@/screens/profile";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Payment Methods",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2182**. Payment Methods — saved cards with a trash button (confirms in an alert, then removes). “+” pushes Add Payment Method." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="payment-methods" /> };

export const NoCards: Story = { name: "No cards", render: () => <PaymentMethodsScreen cards={[]} /> };
