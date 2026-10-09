import type { Meta, StoryObj } from "@storybook/react-vite";
import { WelcomeScreen } from "@/screens/auth";

const meta: Meta<typeof WelcomeScreen> = {
    title: "Sign in ∕ Sign up/Welcome",
    component: WelcomeScreen,
    parameters: { phone: true },
};
export default meta;

export const Default: StoryObj<typeof WelcomeScreen> = {};
