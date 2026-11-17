import type { Meta, StoryObj } from "@storybook/react-vite";
import { McgRoute } from "./mcg-story-kit";

/**
 * The hub's **Instructors** tab (`/instruction/instructors`, or `/instruction?view=instructors`):
 * every MCG Academy pro behind the current search — headshot, name and credential, title, home
 * courses, what they teach that matches, lessons from $, next opening today and the (sample) rating —
 * each linking to their profile. County clinic staff (not on the Academy roster) list their programs.
 * Same search · course · Filters bar as Services.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Instructors/All instructors",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}, name?: string): Story => ({
    ...(name ? { name } : {}),
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

export const Desktop = story("/instruction/instructors", "All 22 bookable Academy instructors plus county clinic staff.");
export const AtCourse = story("/instruction/instructors?course=falls-road", "Narrowed to Falls Road with the course select — the deep link an instructor page on mcggolf.com can use.", {}, "At one course");
export const MobileWeb = story("/instruction/instructors", "Instructor cards 1-up at 390.", { width: "mobile" }, "Mobile web");
export const Dark = story("/instruction?view=instructors", "Warm Dark, via the `?view=instructors` form of the URL.", { dark: true });
