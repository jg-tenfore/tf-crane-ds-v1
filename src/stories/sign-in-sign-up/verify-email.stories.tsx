import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerifyEmailScreen } from "@/screens/auth";

const meta: Meta<typeof VerifyEmailScreen> = {
    title: "Sign in ∕ Sign up/Verify Email",
    component: VerifyEmailScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof VerifyEmailScreen>;

export const Default: Story = {};
export const PartlyEntered: Story = { name: "Partly entered", args: { initialCode: "482", resendAfter: 0 } };
