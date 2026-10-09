import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackNavigator } from "@/components/prototype/stack-navigator";
import { authScreens } from "@/screens/auth";

/**
 * The whole auth flow, clickable end to end:
 * Welcome → Sign up with email → Verify Email (any 6 digits) → Home Course → You're all set,
 * or Welcome → I already have an account → Sign In (→ Forgot password) → You're all set.
 */
const meta: Meta<typeof StackNavigator> = {
    title: "Sign in ∕ Sign up/Flow",
    component: StackNavigator,
    parameters: { phone: true },
};
export default meta;

type Story = StoryObj<typeof StackNavigator>;

export const Flow: Story = { render: () => <StackNavigator screens={authScreens} initialRoute="welcome" /> };
