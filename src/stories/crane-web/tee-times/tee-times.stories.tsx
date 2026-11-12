import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeeTimesPage } from "@/screens/web/tee-times";
import { CLOSED_DAY } from "@/screens/web/tee-times/tee-times-data";
import { WebScreen } from "../web-story-kit";
import { WithCourse } from "./story-helpers";

/**
 * Tee Times (`/tee-times`). Ports Fox **Global Nav / Tee Times / 18 Holes (Sagamore)**: the
 * Course · Date · Players · Holes selector bar over a 4-column grid of tee times, with
 * Fox's "BACK 9" footer label. Adds the Crane app's date strip, FULL and few-spots states,
 * and Morning / Afternoon / Twilight grouping. Mobile web is the iPhone app's one-per-row list.
 * Variants port **3 Courses (Kettle Hills)** + **9-Hole Course Label** (multi-course split label),
 * **Dismissible Banner** and **18 Holes + Membership Ads**.
 */
const meta: Meta = {
    title: "Crane Web/Tee Times/Tee Times",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <WebScreen path="/tee-times"><TeeTimesPage /></WebScreen> };
export const Laptop: Story = { render: () => <WebScreen path="/tee-times" width="laptop"><TeeTimesPage /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path="/tee-times" width="mobile"><TeeTimesPage /></WebScreen> };

/** Ports Fox "3 Courses (Kettle Hills)": Grand View's Pines plays three nines (Lakes / Woods / Marsh), filterable by starting course; twilight nines run in parallel. */
export const MultiCourse: Story = {
    name: "Multi-course",
    render: () => (
        <WebScreen path="/tee-times">
            <WithCourse id="grand-view">
                <TeeTimesPage />
            </WithCourse>
        </WebScreen>
    ),
};

/** Ports Fox "Dismissible Banner" + "18 Holes + Membership Ads". */
export const WithBannerAndAd: Story = {
    name: "With banner & membership ad",
    render: () => <WebScreen path="/tee-times"><TeeTimesPage banner membershipAd /></WebScreen>,
};

/** Live CraneWeb's first-visit state. Select Course opens the course picker. */
export const NoCourseSelected: Story = {
    name: "No course selected",
    render: () => <WebScreen path="/tee-times"><TeeTimesPage noCourse /></WebScreen>,
};

/** A closed day (fall aerification) — no times, with a jump to the next day. */
export const NoTimes: Story = {
    name: "No times",
    render: () => <WebScreen path={`/tee-times?d=${CLOSED_DAY}`}><TeeTimesPage /></WebScreen>,
};
