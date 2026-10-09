import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignInScreen } from "@/screens/auth";
import { USER } from "@/data/crane";

const meta: Meta<typeof SignInScreen> = {
    title: "Sign in ∕ Sign up/Sign In",
    component: SignInScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof SignInScreen>;

export const Default: Story = {};
export const ErrorState: Story = { name: "Error", args: { initialEmail: USER.email, initialPassword: "birdie2025", initialError: true } };
export const Filled: Story = { args: { initialEmail: USER.email, initialPassword: "fairway2026" } };
