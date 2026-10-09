import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Profile ∕ Account/Account Balance",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Recreates **IMG_2180 / IMG_2181**. Balance summary card plus the Pay Balance form; with nothing owed the form renders disabled, as in the reference.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { name: "No balance due", render: () => <ProfileStack route="account-balance" /> };

export const BalanceDue: Story = {
    name: "Balance due",
    render: () => <ProfileStack route="account-balance" params={{ statementBalance: 42.5, todayBalance: 68 }} />,
};
