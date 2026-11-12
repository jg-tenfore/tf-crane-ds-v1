import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarPage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/calendar` — ports Fox **Global Nav/Calendar** (`events-calendar.stories.tsx`: List View + Calendar
 * View) and folds in Fox's clinic calendar (`clinics.stories.tsx`). One feed of events, clinic sessions
 * and league nights, color-coded by type, with type filter chips and month paging. Today is
 * highlighted and past items are muted. Mobile web opens on the list; its month grid shows dots with
 * the selected day's list underneath.
 */
const meta: Meta = {
    title: "Crane Web/Calendar/Calendar",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Month: Story = { name: "Month", render: () => <WebScreen path="/calendar"><CalendarPage /></WebScreen> };
export const List: Story = { name: "List", render: () => <WebScreen path="/calendar?view=list"><CalendarPage initialView="list" /></WebScreen> };
export const ClinicsOnly: Story = { name: "Month · Clinics only", render: () => <WebScreen path="/calendar?type=clinics"><CalendarPage initialTypes={["clinic"]} /></WebScreen> };
export const November: Story = { name: "Month · November", render: () => <WebScreen path="/calendar"><CalendarPage initialMonth={{ y: 2026, m: 10 }} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web · List", render: () => <WebScreen path="/calendar" width="mobile"><CalendarPage /></WebScreen> };
export const MobileMonth: Story = { name: "Mobile web · Month", render: () => <WebScreen path="/calendar" width="mobile"><CalendarPage initialView="month" /></WebScreen> };
