import type { Meta, StoryObj } from "@storybook/react-vite";
import { InstructorProfilePage } from "@/screens/web/instruction/pro/instructor-profile-page";
import { McgRoute, McgScreen } from "./mcg-story-kit";

/**
 * The instructor profile (`/instruction/pro/:id`, and the Academy-style `/instruction/instructors/:id`)
 * — Fox Prototype 3's "instructor as a product page" in Crane Web. Gallery + buy box (MCG Golf
 * Academy lockup, name and credential, title, rating with the **Sample data** tag, lessons from $,
 * home-course chips with logos, next opening, Book a lesson · Save · Share, Academy contact only),
 * then *What they offer*: private lessons with a price-by-group-size grid and Book this lesson, the
 * group clinics they run (registered for right here — Nov 17), the next-openings time board, packs
 * with the "How lesson credits work" steps and the monthly plan, and verified reviews with the
 * illustrative-sample notice. "All instructors" keeps the hub's query.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Instructors/Profile",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}, name?: string): Story => ({
    ...(name ? { name } : {}),
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

export const Desktop = story(
    "/instruction/pro/mike-kenny",
    "Mike Kenny, PGA (Director of Instruction) at 1440: six privates at his rate, his Adult Level 2 clinic, today's openings, two packs and his monthly plan, sample reviews.",
);
export const Laptop = story("/instruction/pro/mike-kenny", "1024: gallery and buy box side by side, the group-size grid four across.", { width: "laptop" });
export const Tablet = story("/instruction/pro/mike-kenny", "768: gallery stacks above the buy box; the time board five across.", { width: "tablet" });
export const MobileWeb = story("/instruction/pro/mike-kenny", "390: thumbnails under the photo, sections stack, price grid two across.", { width: "mobile" }, "Mobile web");
export const Dark = story("/instruction/pro/mike-kenny", "Warm Dark — slots, chips, the sample-data tag and the plan card all on semantic tokens.", { dark: true });
export const WithClinics = story(
    "/instruction/pro/kate-schanuel",
    "Kate Schanuel, LPGA runs two programs (First Swings junior starter, the junior camp) — Weston's point that an instructor's clinics list on their profile and are registered for there.",
    {},
    "Instructor with clinics",
);
export const MultiCourse = story(
    "/instruction/pro/doug-hamilton",
    "Doug Hamilton, Master PGA: three home courses (one menu, a calendar at each) and his own group-size pricing.",
    {},
    "Three courses, own pricing",
);
export const NoOpenings: Story = {
    name: "No openings",
    render: () => (
        <McgScreen path="/instruction/pro/brent-wilkerson">
            <InstructorProfilePage id="brent-wilkerson" fullyBooked />
        </McgScreen>
    ),
    parameters: {
        docs: {
            description: {
                story: "A fully booked instructor: next opening reads “Fully booked”, the board shows its empty state and the primary action becomes Join the waitlist (→ `step=waitlist`).",
            },
        },
    },
};
export const CollectingReviews = story(
    "/instruction/pro/blessing-jasi",
    "Fewer than five verified reviews: no rating is shown yet — “collecting reviews” instead.",
    {},
    "Collecting reviews",
);
export const ReviewsOff = story("/instruction/pro/john-ross", "Reviews switched off for this instructor: no rating, no count and no reviews block at all.", {}, "Reviews off");
export const WithBio = story(
    "/instruction/instructors/mike-dickson",
    "The Academy-style URL renders the same profile. Mike Dickson is the one card the Academy publishes a bio for.",
    {},
    "Academy URL · bio",
);
export const ComingSoon = story("/instruction/pro/jim-smithburger", "A Coming Soon card: placeholder art, no menu or booking — the shop books by phone.", {}, "Coming soon");
export const KeepsHubQuery = story(
    "/instruction/pro/mike-kenny?view=instructors&course=falls-road&formats=private",
    "Arriving from a filtered hub: “All instructors” returns to the same filters.",
    {},
    "Back keeps the hub query",
);
