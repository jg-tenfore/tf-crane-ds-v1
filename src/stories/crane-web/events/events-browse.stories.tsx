import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventsBrowsePage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/events` — ports Fox **Global Nav/Events/Browse Events** (`events-all.stories.tsx`): filter chips
 * (Type · Sort by · Charity · Price · Available), a live count and a photo-led card grid with date
 * badges. Crane adds status pills on the photo (Few spots · Waitlist · Members only) and prices on
 * every card. On mobile web the chips scroll sideways and the grid drops to one column.
 */
const meta: Meta = {
    title: "Crane Web/Events/Browse",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/events"><EventsBrowsePage /></WebScreen> };
export const Laptop: Story = { render: () => <WebScreen path="/events" width="laptop"><EventsBrowsePage /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/events" width="mobile"><EventsBrowsePage /></WebScreen> };
export const CharityFilter: Story = {
    name: "Filtered · Charity",
    render: () => <WebScreen path="/events?charity=1"><EventsBrowsePage initialCharity /></WebScreen>,
};
export const NoResults: Story = {
    name: "Filtered · No results",
    render: () => <WebScreen path="/events?type=tournament&charity=1"><EventsBrowsePage initialKind="tournament" initialCharity /></WebScreen>,
};
