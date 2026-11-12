import type { Meta, StoryObj } from "@storybook/react-vite";
import { USER } from "@/data/crane";
import { SignUpPage } from "@/screens/web/auth";
import { AuthBackgroundContext, type AuthBackground } from "@/screens/web/auth/auth-web-parts";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Sign Up",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Sign in ∕ Sign up/Sign up → Simple** (`AccountSignUp.stories.tsx`) with the Crane app's fields instead of Fox's: first/last name, email (checked on blur), optional phone, password with the live 8+ / number / letter checklist, and terms. Fox's confirm-password and birthday fields are dropped to match the app. “Create account” unlocks once everything required is valid and goes to /verify-email.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Empty: Story = {
    render: () => (
        <WebScreen path="/sign-up" signedIn={false}>
            <SignUpPage />
        </WebScreen>
    ),
};

export const Valid: Story = {
    render: () => (
        <WebScreen path="/sign-up" signedIn={false}>
            <SignUpPage initialValues={{ firstName: USER.firstName, lastName: USER.lastName, email: USER.email, phone: "(617) 555-0100", password: "fairway2026", agreed: true }} />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/sign-up" width="mobile" signedIn={false} height={1100}>
            <SignUpPage />
        </WebScreen>
    ),
};

/* Brand-panel photo options on Sign up. Green is the default (the Empty story above). */
const SignUpWith = ({ background }: { background: AuthBackground }) => (
    <AuthBackgroundContext.Provider value={background}>
        <WebScreen path="/sign-up" signedIn={false}>
            <SignUpPage />
        </WebScreen>
    </AuthBackgroundContext.Provider>
);
export const BackgroundGoldenHour: Story = { name: "Background · Golden hour", render: () => <SignUpWith background="golden-hour" /> };
export const BackgroundMist: Story = { name: "Background · Mist", render: () => <SignUpWith background="mist" /> };
