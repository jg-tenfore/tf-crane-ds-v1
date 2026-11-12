import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { useWebFrame } from "@/components/web/web-frame";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { WebShell } from "@/screens/web/web-shell";
import { eventRoutes } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * Clickable flow over every `eventRoutes` pattern: browse → details → register, plus Clinics,
 * Leagues, Activities and Calendar from the header. Paths outside these sections show a stub.
 */
const meta: Meta = {
    title: "Crane Web/Events/Flow",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const Routes = () => {
    const { path, back } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    useEffect(() => scrollToTop(), [path, scrollToTop]);
    for (const r of eventRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return <>{r.render(params)}</>;
    }
    return (
        <WebShell>
            <WebPage>
                <PageHeader title={path} subtitle="Not part of the Events flow. Pick Events, Clinics, Leagues, Activities or Calendar in the header." />
                <button type="button" onClick={back} className="mt-6 cursor-pointer text-sm font-semibold text-brand-secondary">
                    ← Back
                </button>
            </WebPage>
        </WebShell>
    );
};

export const Desktop: Story = { render: () => <WebScreen path="/events"><Routes /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/events" width="mobile"><Routes /></WebScreen> };
