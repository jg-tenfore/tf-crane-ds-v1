import type { Meta, StoryObj } from "@storybook/react-vite";
import { USER } from "@/data/crane";
import { ForgotPasswordPage } from "@/screens/web/auth";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Forgot Password",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Sign in ∕ Sign up/Forgot password → Forgot Password + Check Email** (`AccountForgotPassword.stories.tsx`) as one route: request a reset link, then the card flips to “Check your inbox” with Back to sign in, Resend link and Use a different email. The email typed on Sign in is carried over via `?email=`. Fox's Set new password / Password reset steps happen on the emailed link, outside this flow.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <WebScreen path="/forgot-password" signedIn={false}>
            <ForgotPasswordPage />
        </WebScreen>
    ),
};

export const Sent: Story = {
    render: () => (
        <WebScreen path={`/forgot-password?email=${encodeURIComponent(USER.email)}`} signedIn={false}>
            <ForgotPasswordPage initialSent />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/forgot-password" width="mobile" signedIn={false}>
            <ForgotPasswordPage initialEmail={USER.email} />
        </WebScreen>
    ),
};
