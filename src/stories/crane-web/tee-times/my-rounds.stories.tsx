import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyRoundsPage } from "@/screens/web/tee-times";
import { WebScreen } from "../web-story-kit";

/** My Rounds (`/tee-times/my-rounds`, `/past`). Ports Fox **Booking / Pages / My Rounds**: Upcoming / Past tabs, round rows, empty states. */
const meta: Meta = {
    title: "Crane Web/Tee Times/My Rounds",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Upcoming: Story = { render: () => <WebScreen path="/tee-times/my-rounds"><MyRoundsPage /></WebScreen> };
export const Past: Story = { render: () => <WebScreen path="/tee-times/my-rounds/past"><MyRoundsPage tab="past" /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/tee-times/my-rounds" width="mobile"><MyRoundsPage /></WebScreen> };
export const Empty: Story = { render: () => <WebScreen path="/tee-times/my-rounds"><MyRoundsPage empty /></WebScreen> };
