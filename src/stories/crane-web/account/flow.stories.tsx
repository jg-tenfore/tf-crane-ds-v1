import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, LogIn01 } from "@untitledui/icons";
import { useWebFrame } from "@/components/web/web-frame";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter, WebLink } from "@/components/web/web-router";
import { accountRoutes } from "@/screens/web/account";
import { WebShell, useWebSession } from "@/screens/web/web-shell";
import { USER } from "@/data/crane";
import { WebButton } from "@/screens/web/account/account-ui";
import { WebScreen } from "../web-story-kit";

/** Anything outside /account (tee times, events, sign in…) belongs to another flow. */
const OutsideFlow = () => {
    const { path, navigate } = useWebRouter();
    const { userName, setUserName } = useWebSession();
    const signedOut = path.startsWith("/sign-in") || !userName;
    return (
        <WebShell>
            <WebPage width="content">
                <div className="rounded-xl bg-primary p-8 ring-1 ring-secondary ring-inset">
                    <PageHeader
                        eyebrow={signedOut ? "Signed out" : "Another flow"}
                        title={signedOut ? "You're signed out" : path.split("?")[0]}
                        subtitle={signedOut ? "Sign in is built in the Sign in ∕ Sign up flow. Sign back in to keep clicking through Profile ∕ Account." : "This page belongs to another Crane Web flow. Head back to keep clicking through Profile ∕ Account."}
                    />
                    <div className="mt-6 flex flex-wrap gap-3">
                        {signedOut ? (
                            <WebButton
                                iconLeading={LogIn01}
                                onPress={() => {
                                    setUserName(USER.firstName);
                                    navigate("/account");
                                }}
                            >
                                Sign back in
                            </WebButton>
                        ) : (
                            <WebLink href="/account" className="caps inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-brand-secondary ring-1 ring-brand ring-inset">
                                <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to My Profile
                            </WebLink>
                        )}
                    </div>
                </div>
            </WebPage>
        </WebShell>
    );
};

/** Route switch over `accountRoutes`; scrolls to top on every page change. */
const AccountFlow = () => {
    const { path } = useWebRouter();
    const frame = useWebFrame();
    const scrollRef = useRef(frame.scrollToTop);
    scrollRef.current = frame.scrollToTop;
    const pagePath = path.split("?")[0];
    useEffect(() => {
        scrollRef.current();
    }, [pagePath]);
    const route = accountRoutes.find((r) => matchPath(r.pattern, path));
    if (!route) return <OutsideFlow />;
    const Screen = route.screen;
    return <Screen key={route.pattern} />;
};

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Flow",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Clickable Profile ∕ Account: every page from `accountRoutes` behind one router, starting at `/account`. Use the side nav (or the tabs on mobile web), stat tiles, Upcoming rows, Activity tabs and receipts, and the event quick-look. Sign out clears the session and lands on `/sign-in`; links into other areas (Tee Times, Events, Shop) show a placeholder with a way back. Replaces the Fox **Profile ∕ Account** stories as one flow.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/account"><AccountFlow /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/account" width="mobile"><AccountFlow /></WebScreen> };
