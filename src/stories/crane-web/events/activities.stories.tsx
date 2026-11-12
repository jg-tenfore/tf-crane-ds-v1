import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivitiesPage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/activities` — simulator bays first, porting Fox **Global Nav/Tee Times/FloGolf Indoor**
 * (`tenfore-simulator-flogolf.stories.tsx`): bays with seating and capacity, 30-minute slots from
 * 10 AM to 10 PM, booked blocks, day/evening rate tiers, and bays too small for the party disabled.
 * Crane simplifies Fox's tap-start-then-end strips to date → players → duration → bay → start time,
 * highlighting the whole window. Other activities (range, lessons, juniors, outings) follow as cards.
 */
const meta: Meta = {
    title: "Crane Web/Activities/Simulator Bays",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/activities"><ActivitiesPage /></WebScreen> };
export const TimeSelected: Story = {
    name: "Time selected",
    render: () => <WebScreen path="/activities"><ActivitiesPage initialBay={2} initialStart={18 * 60} initialPlayers={6} /></WebScreen>,
};
export const BigGroup: Story = {
    name: "8 players · small bays disabled",
    render: () => <WebScreen path="/activities"><ActivitiesPage initialBay={3} initialPlayers={8} initialDuration={120} /></WebScreen>,
};
export const BookDialog: Story = {
    name: "Book dialog",
    render: () => <WebScreen path="/activities"><ActivitiesPage initialBay={2} initialStart={18 * 60} initialPlayers={6} initialStep="confirm" /></WebScreen>,
};
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/activities" width="mobile"><ActivitiesPage /></WebScreen> };
export const MobileTimeSelected: Story = {
    name: "Mobile web · Time selected",
    render: () => <WebScreen path="/activities" width="mobile"><ActivitiesPage initialStart={15 * 60} /></WebScreen>,
};
