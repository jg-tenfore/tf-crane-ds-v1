import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClinicDetailPage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/clinics/:id` — ports Fox **Global Nav/Clinics/Clinic Details** (`clinic-detail.stories.tsx`:
 * default, junior, playing lesson). Focus + skill level, what you'll learn, who it's for, what to
 * bring, the instructor and a sticky reserve card. Crane adds the session schedule for multi-week
 * series, a spots meter, the waitlist when full and a confirmation dialog.
 */
const meta: Meta = {
    title: "Crane Web/Clinics/Clinic Details",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const at = (id: string) => `/clinics/${id}`;

export const Desktop: Story = { name: "Series · Few spots", render: () => <WebScreen path={at("short-game-series")}><ClinicDetailPage id="short-game-series" /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={at("short-game-series")} width="mobile"><ClinicDetailPage id="short-game-series" /></WebScreen> };
export const Junior: Story = { render: () => <WebScreen path={at("junior-fall-academy")}><ClinicDetailPage id="junior-fall-academy" /></WebScreen> };
export const SingleSession: Story = { name: "Single session", render: () => <WebScreen path={at("driver-distance-clinic")}><ClinicDetailPage id="driver-distance-clinic" /></WebScreen> };
export const FullWaitlist: Story = { name: "Full · Waitlist", render: () => <WebScreen path={at("golf-101")}><ClinicDetailPage id="golf-101" /></WebScreen> };
export const ReserveDialog: Story = { name: "Reserve dialog", render: () => <WebScreen path={at("short-game-series")}><ClinicDetailPage id="short-game-series" initialStep="confirm" /></WebScreen> };
export const Reserved: Story = { render: () => <WebScreen path={at("short-game-series")}><ClinicDetailPage id="short-game-series" initialRegistered /></WebScreen> };
