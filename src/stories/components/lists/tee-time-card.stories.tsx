import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Screen } from "@/components/device/screen";
import { TeeTimeCard, type TeeTime } from "@/components/lists/tee-time-card";
import { CourseHeader } from "@/components/navigation/course-header";
import { buildDays, DateStrip } from "@/components/navigation/date-strip";
import { courseById, teeSheet } from "@/data/crane";
import { Panel } from "../story-kit";

/**
 * TeeTimeCard — one row on the tee sheet. Available times are full white cards
 * (time, price, spots, holes, course, and "Reserved (xN)" when others are already
 * booked). Sold-out times collapse to a dimmed single line with a FULL tag.
 */
const BASE: TeeTime = { id: "t-1", time: "9:30 AM", price: 53, spots: 4, holes: 18, course: "SHGC" };

const meta: Meta<typeof TeeTimeCard> = {
    title: "Components/Lists & Cards/Tee Time Card",
    component: TeeTimeCard,
    tags: ["autodocs"],
    args: { teeTime: BASE },
    render: (args) => (
        <Panel className="w-[402px] px-4">
            <TeeTimeCard {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof TeeTimeCard>;

export const Available: Story = {};

export const WithReserved: Story = { name: "With reserved players", args: { teeTime: { ...BASE, time: "9:03 AM", spots: 2, reserved: 2 } } };

export const OneSpot: Story = { name: "1 spot", args: { teeTime: { ...BASE, time: "10:33 AM", spots: 1, reserved: 3 } } };

export const Full: Story = { args: { teeTime: { ...BASE, time: "8:54 AM", spots: 0 } } };

export const NineHoles: Story = { name: "9 holes", args: { teeTime: { ...BASE, time: "2:36 PM", price: 38, holes: 9, course: "Mount Hood" } } };

const SHEET = teeSheet(courseById("sagamore-hampton"));
const DAYS = buildDays(new Date(2026, 9, 9));

const TeeSheetScreen = () => {
    const [day, setDay] = useState(DAYS[0].id);
    return (
        <Screen nav={<CourseHeader courseName="Sagamore Hampton Golf Club" city="North Hampton" />}>
            <DateStrip days={DAYS} selectedId={day} onChange={setDay} />
            <div className="space-y-3 px-gutter pt-2">
                {SHEET.map((t) => (
                    <TeeTimeCard key={t.id} teeTime={t} />
                ))}
            </div>
        </Screen>
    );
};

/** A busy Saturday morning: `teeSheet(courseById("sagamore-hampton"))`. */
export const TeeSheet: Story = { name: "Tee sheet", parameters: { phone: true }, render: () => <TeeSheetScreen /> };
