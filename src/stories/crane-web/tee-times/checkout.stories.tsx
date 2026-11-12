import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeeTimeCheckoutPage } from "@/screens/web/tee-times";
import { WebScreen } from "../web-story-kit";

/**
 * Tee time checkout (`/tee-times/checkout?d=&t=&p=`). Ports Fox **Tee Time Checkout / Tee Time
 * Details** ("You're one step from the first tee"): Players · Holes · Transportation bar, player
 * rows (Confirmed / Added · Tap to edit) with add-a-golf-buddy, Common questions, Booking Summary,
 * the **Time left to book** hold timer and Reserve. Adds the app's booking notice, 24-hour
 * cancellation warning and golf-car cutoff.
 */
const meta: Meta = {
    title: "Crane Web/Tee Times/Checkout",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const path = (p: number) => `/tee-times/checkout?p=${p}`;

export const OnePlayer: Story = { name: "1 player", render: () => <WebScreen path={path(1)}><TeeTimeCheckoutPage /></WebScreen> };
export const TwoPlayers: Story = { name: "2 players", render: () => <WebScreen path={path(2)}><TeeTimeCheckoutPage /></WebScreen> };
export const FourPlayers: Story = { name: "4 players", render: () => <WebScreen path={path(4)}><TeeTimeCheckoutPage /></WebScreen> };
/** The 5:00 hold ran out: Reserve is replaced by "Find another time". */
export const HoldExpired: Story = { name: "Hold expired", render: () => <WebScreen path={path(2)}><TeeTimeCheckoutPage holdSeconds={0} /></WebScreen> };
/** Summary collapses to a disclosure; Reserve and the hold countdown stick to the bottom. */
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path(2)} width="mobile"><TeeTimeCheckoutPage /></WebScreen> };
/** Guests are sent to sign in (?next= returns here) before reserving. */
export const Guest: Story = { render: () => <WebScreen path={path(1)} signedIn={false}><TeeTimeCheckoutPage /></WebScreen> };
