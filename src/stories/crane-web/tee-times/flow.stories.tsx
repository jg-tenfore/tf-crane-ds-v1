import type { Meta, StoryObj } from "@storybook/react-vite";
import { matchPath, useWebRouter } from "@/components/web/web-router";
import { teeTimeRoutes, TeeTimeRoundsProvider } from "@/screens/web/tee-times";
import { WebScreen } from "../web-story-kit";

/**
 * The whole tee-time flow, clickable: Tee Times → Checkout → Confirmation → My Rounds.
 * A small route switch over `teeTimeRoutes`; rounds you reserve show up in My Rounds.
 */
const meta: Meta = {
    title: "Crane Web/Tee Times/Flow",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const Routes = () => {
    const { path } = useWebRouter();
    for (const r of teeTimeRoutes) {
        const params = matchPath(r.pattern, path);
        if (params) return <div key={path.split("?")[0]} className="contents">{r.render(params)}</div>;
    }
    return <div className="p-10 text-md text-tertiary">Not part of the tee-time flow: {path}</div>;
};

export const Flow: Story = {
    render: () => (
        <WebScreen path="/tee-times">
            <TeeTimeRoundsProvider>
                <Routes />
            </TeeTimeRoundsProvider>
        </WebScreen>
    ),
};
export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => (
        <WebScreen path="/tee-times" width="mobile">
            <TeeTimeRoundsProvider>
                <Routes />
            </TeeTimeRoundsProvider>
        </WebScreen>
    ),
};
