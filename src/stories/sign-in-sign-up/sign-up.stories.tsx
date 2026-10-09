import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignUpScreen } from "@/screens/auth";
import { USER } from "@/data/crane";

const meta: Meta<typeof SignUpScreen> = {
    title: "Sign in ∕ Sign up/Sign Up",
    component: SignUpScreen,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof SignUpScreen>;

export const Empty: Story = {};
export const Valid: Story = {
    args: {
        initialValues: {
            firstName: USER.firstName,
            lastName: USER.lastName,
            email: USER.email,
            phone: USER.phone,
            password: "fairway2026",
            agreed: true,
        },
    },
};
