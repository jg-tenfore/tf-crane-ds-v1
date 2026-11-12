import type { Meta, StoryObj } from "@storybook/react-vite";
import { SignedInPage } from "@/screens/web/auth";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Welcome",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Sign in ∕ Sign up/Verification → Success** (`AccountVerification.stories.tsx`) merged with the Crane app's Signed In screen: “You’re all set”, the chosen home courses, then Go to my account (or `?next=`) / Book a tee time. Route: /welcome.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const NewAccount: Story = {
    name: "New account",
    render: () => (
        <WebScreen path="/welcome?mode=sign-up&courses=sagamore-spring,mount-hood">
            <SignedInPage />
        </WebScreen>
    ),
};

export const WelcomeBack: Story = {
    name: "Welcome back",
    render: () => (
        <WebScreen path="/welcome?mode=sign-in">
            <SignedInPage />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/welcome?mode=sign-up&courses=sagamore-spring,mount-hood" width="mobile">
            <SignedInPage />
        </WebScreen>
    ),
};
