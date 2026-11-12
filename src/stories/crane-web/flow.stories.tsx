import type { Meta, StoryObj } from "@storybook/react-vite";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebScreen } from "./web-story-kit";

/**
 * Crane Web, clickable: every area stitched together on one router. Use the header to move
 * between sections; the address bar shows each page's deep link.
 */
const meta: Meta = {
    title: "Crane Web/Flow",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const routes = webRoutes();

export const Desktop: Story = { render: () => <WebScreen path="/tee-times"><CraneWebRoutes routes={routes} /></WebScreen> };
export const DesktopSidebarNav: Story = {
    name: "Desktop · sidebar shop nav",
    render: () => (
        <WebScreen path="/shop/golf-balls">
            <CraneWebRoutes routes={webRoutes({ shopNav: "sidebar" })} />
        </WebScreen>
    ),
};
export const Guest: Story = { render: () => <WebScreen path="/tee-times" signedIn={false}><CraneWebRoutes routes={routes} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/tee-times" width="mobile"><CraneWebRoutes routes={routes} /></WebScreen> };
