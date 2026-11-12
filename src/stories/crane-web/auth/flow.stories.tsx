import type { Meta, StoryObj } from "@storybook/react-vite";
import { RefreshCw01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { authRoutes } from "@/screens/web/auth";
import { useWebSession, WebShell } from "@/screens/web/web-shell";
import { WebScreen } from "../web-story-kit";

/** Stand-in for pages owned by other Crane Web areas (/account, /tee-times, /shop…). */
const OutsideAuth = ({ path }: { path: string }) => {
    const { navigate } = useWebRouter();
    const { userName, setUserName } = useWebSession();
    return (
        <WebShell>
            <WebPage width="content">
                <PageHeader eyebrow="End of the auth flow" title={path.split("?")[0]} subtitle={userName ? `Signed in as ${userName}.` : "Signed out."} />
                <Panel className="mt-8" bodyClassName="flex flex-col gap-4 p-6 @tablet:flex-row @tablet:items-center">
                    <p className="flex-1 text-md text-tertiary">This page belongs to another Crane Web area. In the full prototype the lead's router renders it here.</p>
                    <Button
                        iconLeading={RefreshCw01}
                        className="rounded-lg text-md"
                        onPress={() => {
                            setUserName(null);
                            navigate("/sign-in");
                        }}
                    >
                        Sign out and restart
                    </Button>
                </Panel>
            </WebPage>
        </WebShell>
    );
};

/** A tiny route switch over `authRoutes`. */
const AuthFlow = () => {
    const { path } = useWebRouter();
    for (const r of authRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return <div key={r.pattern} className="contents">{r.render(params)}</div>;
    }
    return <OutsideAuth path={path} />;
};

const meta: Meta = {
    title: "Crane Web/Sign in ∕ Sign up/Flow",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Clickable Crane Web auth flow over `authRoutes` (ports Fox's Log in, Sign up, Verification and Forgot password stories as one flow). Sign in → /account; Forgot password? → /forgot-password; Log in | Sign up switch → /sign-up → /verify-email (type any 6 digits) → /welcome/home-course → /welcome → /account. The **With ?next=** story starts from checkout and returns there.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Flow: Story = {
    render: () => (
        <WebScreen path="/sign-in" signedIn={false}>
            <AuthFlow />
        </WebScreen>
    ),
};

export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/sign-in" width="mobile" signedIn={false}>
            <AuthFlow />
        </WebScreen>
    ),
};

export const WithNext: Story = {
    name: "With ?next=",
    render: () => (
        <WebScreen path="/sign-in?next=/checkout" signedIn={false}>
            <AuthFlow />
        </WebScreen>
    ),
};
