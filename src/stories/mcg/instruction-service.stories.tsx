import type { Meta, StoryObj } from "@storybook/react-vite";
import { McgRoute } from "./mcg-story-kit";

/**
 * `/instruction/service/:id` — what a hub result opens. A **private lesson** shows its duration,
 * party size and price by group size, then every instructor who teaches it (narrowed by `?course=`)
 * with a Book link each, plus "Any available instructor" once a course is picked. A **group program**
 * or **county clinic** shows its art, schedule and session dates, location, instructor, capacity and
 * Register / Join waitlist. Back returns to the hub with the search it came from.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Instruction/Service",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}, name?: string): Story => ({
    ...(name ? { name } : {}),
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

export const PrivateLesson = story(
    "/instruction/service/private-45?course=falls-road",
    "45-minute private at Falls Road: nine instructors with their own price and next opening, Book each, and the group-size price table.",
    {},
    "Private lesson",
);
export const PrivateLessonAnyCourse = story("/instruction/service/private-45", "No course yet: every instructor across the county; Any available instructor waits for a course.", {}, "Private lesson · any course");
export const PrivateLessonMobile = story("/instruction/service/private-60?course=needwood", "60-minute private at Needwood, mobile web.", { width: "mobile" }, "Private lesson · mobile");
export const GroupClinic = story(
    "/instruction/service/clinic-adult-l2?course=falls-road",
    "An Academy program (Adult Level 2): banner, schedule and every session date, instructor with a profile link, spots meter and Register.",
    {},
    "Group clinic",
);
export const CountyClinicWaitlist = story(
    "/instruction/service/ggr-needwood?formats=clinic,junior-camp,junior-league,op36",
    "A full county clinic (Get Golf Ready at Needwood): Waitlist badge, 12 of 12 taken, Join waitlist. Back reads \"Clinics & programs\" because it came from there.",
    {},
    "County clinic (waitlist)",
);
export const CountyClinicMobile = story("/instruction/service/ggr-northwest", "County clinic at 390: the price card moves above the details and a sticky bar keeps Register in reach.", { width: "mobile" }, "County clinic · mobile");
export const Dark = story("/instruction/service/ggr-northwest", "County clinic in Warm Dark.", { dark: true });
export const NotFound = story("/instruction/service/not-a-lesson", "An unknown id: a short message and a way back to Instruction.", {}, "Not found");
