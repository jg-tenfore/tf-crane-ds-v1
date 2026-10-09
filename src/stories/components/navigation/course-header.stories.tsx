import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Screen } from "@/components/device/screen";
import { CourseHeader } from "@/components/navigation/course-header";
import { buildDays, DateStrip } from "@/components/navigation/date-strip";
import { UnderlineTabs } from "@/components/navigation/underline-tabs";
import { TeeTimeCard } from "@/components/lists/tee-time-card";
import { COURSE_SECTIONS, courseById, teeSheet } from "@/data/crane";

/**
 * CourseHeader — Home tab top chrome: hamburger (My Locations drawer), the active course
 * name + city (tap for course info), and the cart with a count badge. Everything below it
 * is scoped to this course.
 */
const meta: Meta<typeof CourseHeader> = {
    title: "Components/Navigation/Course Header",
    component: CourseHeader,
    parameters: { phone: true },
    args: { courseName: "Sagamore Hampton Golf Club", city: "North Hampton", cartCount: 2 },
    argTypes: { cartCount: { control: { type: "number", min: 0, max: 120 } } },
};
export default meta;
type Story = StoryObj<typeof CourseHeader>;

const DAYS = buildDays(new Date(2026, 9, 9));
const SHEET = teeSheet(courseById("sagamore-hampton"));

const HomeTab = (args: Parameters<typeof CourseHeader>[0]) => {
    const [section, setSection] = useState("tee");
    const [day, setDay] = useState(DAYS[0].id);
    return (
        <Screen nav={<CourseHeader {...args} />}>
            <UnderlineTabs aria-label="Course sections" tabs={COURSE_SECTIONS} selectedId={section} onChange={setSection} layout="scroll" />
            <DateStrip days={DAYS} selectedId={day} onChange={setDay} className="pt-3" />
            <div className="space-y-3 px-gutter pt-2">
                {SHEET.map((t) => (
                    <TeeTimeCard key={t.id} teeTime={t} />
                ))}
            </div>
        </Screen>
    );
};

/** With 2 items in the cart, over the Home tab's tee sheet. */
export const WithCart: Story = { name: "With cart count", render: (args) => <HomeTab {...args} /> };

/** Empty cart — no badge. */
export const EmptyCart: Story = { name: "Empty cart", args: { cartCount: 0 }, render: (args) => <HomeTab {...args} /> };

/** Long course names truncate around the centered title. */
export const LongName: Story = {
    name: "Long course name",
    args: { courseName: "Grand View Lodge - The Pines Championship Course", city: "Nisswa", cartCount: 0 },
    render: (args) => <HomeTab {...args} />,
};
