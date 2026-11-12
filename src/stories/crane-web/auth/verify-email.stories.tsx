import type { Meta, StoryObj } from "@storybook/react-vite";
import { USER } from "@/data/crane";
import { VerifyEmailPage } from "@/screens/web/auth";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Verify Email",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Sign in ∕ Sign up/Verification → Code Entry** (`AccountVerification.stories.tsx`) with the Crane app's behaviour: six digits auto-submit after a short “Verifying…” beat, resend is locked behind a 30-second countdown, “Use a different email” goes back to Sign up. Next: /welcome/home-course.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <WebScreen path={`/verify-email?email=${encodeURIComponent(USER.email)}`} signedIn={false}>
            <VerifyEmailPage />
        </WebScreen>
    ),
};

export const PartlyEntered: Story = {
    name: "Partly entered",
    render: () => (
        <WebScreen path={`/verify-email?email=${encodeURIComponent(USER.email)}`} signedIn={false}>
            <VerifyEmailPage initialCode="482" resendAfter={0} />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path={`/verify-email?email=${encodeURIComponent(USER.email)}`} width="mobile" signedIn={false}>
            <VerifyEmailPage />
        </WebScreen>
    ),
};
