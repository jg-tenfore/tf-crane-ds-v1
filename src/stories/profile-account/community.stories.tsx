import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Community",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Recreates **IMG_2176** (lines typing in) and **IMG_2177** (final). The title fades up, the four lines type out one by one, then \"Let's go\" springs in.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { name: "Animated intro", render: () => <ProfileStack route="community" /> };

export const Final: Story = { name: "Final state", render: () => <ProfileStack route="community" params={{ animate: false }} /> };
