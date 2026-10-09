import type { Meta, StoryObj } from "@storybook/react-vite";
import { ForgotPasswordScreen } from "@/screens/auth";
import { USER } from "@/data/crane";

const meta: Meta<typeof ForgotPasswordScreen> = {
    title: "Sign in ∕ Sign up/Forgot Password",
    component: ForgotPasswordScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof ForgotPasswordScreen>;

export const Default: Story = {};
export const Sent: Story = { args: { initialEmail: USER.email, initialSent: true } };
