import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClinicsBrowsePage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/clinics` — ports Fox **Global Nav/Clinics** (`clinics.stories.tsx`). Fox's agenda rows become
 * clinic cards: skill level, focus, sessions, instructor, price and a spots meter. Filters: level,
 * focus, available. Fox's clinic month view now lives on **Crane Web/Calendar** (filter: Clinics).
 */
const meta: Meta = {
    title: "Crane Web/Clinics/Browse",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/clinics"><ClinicsBrowsePage /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/clinics" width="mobile"><ClinicsBrowsePage /></WebScreen> };
export const Beginner: Story = { name: "Filtered · Beginner", render: () => <WebScreen path="/clinics?level=beginner"><ClinicsBrowsePage initialLevel="Beginner" /></WebScreen> };
