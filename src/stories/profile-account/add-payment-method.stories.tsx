import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Add Payment Method",
    parameters: {
        phone: true,
        docs: { description: { component: "Recreates **IMG_2183**. Add Payment Method — chevron-only back, course strip, CardConnect caption and the FieldGroup card form." } },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="add-payment-method" /> };
