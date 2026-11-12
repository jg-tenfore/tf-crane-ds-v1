import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeeTimeConfirmationPage } from "@/screens/web/tee-times";
import { confirmationPath, defaultTeeTime, seedPlayers, TODAY_ID, DAYS, type Player } from "@/screens/web/tee-times/tee-times-data";
import { courseById } from "@/data/crane";
import { WebScreen } from "../web-story-kit";

/**
 * Tee time confirmation (`/tee-times/confirmation/:id`). Ports Fox **Tee Time Checkout /
 * Confirmation - Tee Time** (receipt card: confirmation #, course photo, tee time details,
 * who's going, payment, important information, cancel) and **Booking / Pages / Confirmation**
 * ("You're booked!", add to calendar, directions, manage booking).
 */
const meta: Meta = {
    title: "Crane Web/Tee Times/Confirmation",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const sagamore = courseById("sagamore-spring");
const date = DAYS[3].id; // a few days out — free cancellation applies
const players = seedPlayers(3).filter((p): p is Player => !!p);
const url = confirmationPath({ date, teeTimeId: defaultTeeTime(sagamore, date, 3).id, players, holes: 18, transport: "cart" });
const id = url.split("/").pop()!.split("?")[0];

export const Desktop: Story = { render: () => <WebScreen path={url}><TeeTimeConfirmationPage id={id} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={url} width="mobile"><TeeTimeConfirmationPage id={id} /></WebScreen> };

const todayUrl = confirmationPath({ date: TODAY_ID, teeTimeId: defaultTeeTime(sagamore, TODAY_ID, 1).id, players: players.slice(0, 1), holes: 18, transport: "walking" });
/** Booked for today — inside the 24-hour window, so it can't be cancelled online. */
export const InsideTwentyFourHours: Story = {
    name: "Inside 24 hours",
    render: () => <WebScreen path={todayUrl}><TeeTimeConfirmationPage id={todayUrl.split("/").pop()!.split("?")[0]} /></WebScreen>,
};
