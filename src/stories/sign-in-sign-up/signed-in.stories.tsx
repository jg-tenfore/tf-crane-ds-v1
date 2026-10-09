import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignedInScreen } from "@/screens/auth";

const meta: Meta<typeof SignedInScreen> = {
    title: "Sign in ∕ Sign up/Signed In",
    component: SignedInScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof SignedInScreen>;

export const NewAccount: Story = { name: "New account", args: { mode: "sign-up", courses: ["mount-hood", "sagamore-spring"] } };
export const ReturningMember: Story = { name: "Returning member", args: { mode: "sign-in" } };
