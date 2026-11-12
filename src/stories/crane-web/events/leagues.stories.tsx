import type { Meta, StoryObj } from "@storybook/react-vite";
import { LeaguesBrowsePage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/leagues` — **new** for Crane Web (Fox had no leagues page), designed to match Events and Clinics.
 * Weekly leagues as cards: day, time, format, team or individual, season fee and spots. A "Your
 * league" strip links straight to standings when the golfer is already on a team.
 */
const meta: Meta = {
    title: "Crane Web/Leagues/Browse",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/leagues"><LeaguesBrowsePage /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/leagues" width="mobile"><LeaguesBrowsePage /></WebScreen> };
export const SignedOut: Story = { name: "Signed out", render: () => <WebScreen path="/leagues" signedIn={false}><LeaguesBrowsePage /></WebScreen> };
