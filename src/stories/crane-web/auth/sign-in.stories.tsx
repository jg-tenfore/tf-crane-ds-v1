import type { Meta, StoryObj } from "@storybook/react-vite";
import { USER } from "@/data/crane";
import { SignInPage } from "@/screens/web/auth";
import { AuthBackgroundContext, type AuthBackground } from "@/screens/web/auth/auth-web-parts";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Sign In",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Sign in ∕ Sign up/Log in → Simple** (`AccountLogIn.stories.tsx`): Sign up | Log in switch, email + password with icons, Remember me, Forgot password?, green Sign in, “Or continue with” Google / Apple. On Crane Web it sits in a split card under the course header: the course/brand panel on the left (desktop and laptop), the form on the right; mobile web drops the panel. Success signs the session in and goes to `?next=` or /account.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
    render: () => (
        <WebScreen path="/sign-in" signedIn={false}>
            <SignInPage />
        </WebScreen>
    ),
};

export const ErrorState: Story = {
    name: "Error",
    render: () => (
        <WebScreen path="/sign-in" signedIn={false}>
            <SignInPage initialEmail={USER.email} initialPassword="birdie2025" initialError />
        </WebScreen>
    ),
};

export const Laptop: Story = {
    render: () => (
        <WebScreen path="/sign-in" width="laptop" signedIn={false}>
            <SignInPage />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/sign-in" width="mobile" signedIn={false}>
            <SignInPage />
        </WebScreen>
    ),
};

/** Brand-panel photo options (Sagamore course imagery under a deep-green wash). Green is the default. */
const WithBackground = ({ background }: { background: AuthBackground }) => (
    <AuthBackgroundContext.Provider value={background}>
        <WebScreen path="/sign-in" signedIn={false}>
            <SignInPage />
        </WebScreen>
    </AuthBackgroundContext.Provider>
);
export const BackgroundGoldenHour: Story = { name: "Background · Golden hour", render: () => <WithBackground background="golden-hour" /> };
export const BackgroundMist: Story = { name: "Background · Mist", render: () => <WithBackground background="mist" /> };
