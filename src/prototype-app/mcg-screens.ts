import { bookHref, clinicsHref, creditsHref, instructionHref, instructorHref, packagesHref, proHref, reviewHref, serviceHref } from "@/screens/web/instruction/data/query";
import type { ScreenGroup } from "./web-presenter";

const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname);
const STORY = "?path=/docs/prototypes-mcg-instruction-screen-index--docs";
/** Storybook › Prototypes › MCG Instruction: :6021 locally, two levels up from /prototype/mcg/ on GitHub Pages. */
export const MCG_STORYBOOK_URL = isLocal() ? `${location.protocol}//${location.hostname}:6021/${STORY}` : `../../${STORY}`;

const LESSON = "/instruction/book?coach=mike-kenny&service=private-45&course=falls-road";
const REVIEW = "/instruction/review?coach=mike-kenny&service=private-45&course=falls-road";

/**
 * The MCG prototype's jump list (prototype/mcg/): Home, every Instruction route and the deep-link
 * examples from the Nov 17 call. Screen agents: add your states here as they land.
 */
export const MCG_SCREEN_GROUPS: ScreenGroup[] = [
    { label: "Montgomery County Golf", items: [["Home", "/"], ["Tee Times", "/tee-times"], ["Events", "/events"], ["Calendar", "/calendar"], ["Grill", "/restaurant"]] },
    {
        label: "Instruction",
        items: [
            ["Hub (collapsed)", instructionHref()],
            ["Hub · filters open", instructionHref({ expanded: true })],
            ["Instructors tab", instructionHref({ view: "instructors" })],
            ["Instructors (path)", "/instruction/instructors"],
            ["Clinics → group programs", "/clinics"],
            ["Group programs", clinicsHref()],
            ["Service · 45-min private", serviceHref("private-45", "falls-road")],
            ["Service · county clinic", serviceHref("ggr-northwest")],
            ["Service · county clinic (waitlist)", serviceHref("ggr-needwood")],
            ["Service · Academy program", serviceHref("clinic-adult-l2", "falls-road")],
            ["Service · private, any course", serviceHref("private-45")],
            ["Instructors · Falls Road", "/instruction/instructors?course=falls-road"],
            ["Instructors · saved only", instructionHref({ view: "instructors", extra: { saved: "1" } })],
            ["Service · 3-Week November Clinic", serviceHref("clinic-3wk-nov", "falls-road")],
            ["Hub · Sat clinics, Needwood", instructionHref({ formats: ["clinic"], courses: ["needwood"], days: [6] })],
            ["Hub · no results (Mon, Needwood)", instructionHref({ formats: ["clinic"], courses: ["needwood"], days: [1] })],
        ],
    },
    {
        label: "Instructor & booking",
        items: [
            ["Profile · Mike Kenny", proHref("mike-kenny")],
            ["Profile · Academy URL", instructorHref("doug-hamilton")],
            ["Profile · with clinics", proHref("kate-schanuel")],
            ["Profile · coming soon", proHref("jim-smithburger")],
            ["Book · Mike Kenny 45-min", bookHref({ coach: "mike-kenny", service: "private-45", course: "falls-road" })],
            ["Book · time selected", `${LESSON}&date=2026-10-09&time=09:00`],
            ["Book · any instructor", bookHref({ coach: "any", service: "private-60", course: "needwood" })],
            ["Book · waitlist", bookHref({ coach: "mike-kenny", service: "private-45", course: "falls-road", step: "waitlist" })],
            ["Book · payment with credit", `${LESSON}&date=2026-10-09&time=09:00&step=payment&pay=credit`],
            ["Book · payment with promo", `${LESSON}&date=2026-10-09&time=09:00&step=payment&promo=WELCOME10`],
            ["Book · nothing picked", "/instruction/book"],
            ["Register · Academy program", bookHref({ coach: "mike-kenny", service: "clinic-adult-l2", course: "falls-road" })],
            ["Register · county clinic, pick dates", bookHref({ coach: "any", service: "short-game-school-needwood", course: "needwood" })],
            ["Register · full program", bookHref({ coach: "brent-wilkerson", service: "clinic-wedge", course: "needwood", step: "waitlist" })],
            ["Confirmation · booked", `${REVIEW}&date=2026-10-09&time=09:00&players=1&step=booked&confirmation=MCG-48213&pay=pm-amex`],
            ["Confirmation · waitlisted", `${REVIEW}&date=2026-10-09&time=09:00&players=1&step=waitlisted&confirmation=WL-10421`],
            ["Confirmation · registered", "/instruction/review?coach=mike-kenny&service=clinic-adult-l2&course=falls-road&players=1&step=registered&confirmation=REG-20931&paid=189.00"],
            ["Review a lesson", reviewHref({ coachId: "mike-kenny", serviceId: "private-45", courseSlug: "falls-road", date: "2026-10-02" })],
        ],
    },
    {
        label: "Packages & credits",
        items: [
            ["Packages", packagesHref()],
            ["Packages · Doug Hamilton", packagesHref({ coach: "doug-hamilton" })],
            ["Packages · 10 lessons", packagesHref({ extra: { lessons: "10" } })],
            ["Pack · Mike Kenny 5", packagesHref({ pack: "mike-kenny--pack-5" })],
            ["Pack · checkout", packagesHref({ pack: "mike-kenny--pack-5", step: "checkout" })],
            ["Pack · purchased", packagesHref({ pack: "mike-kenny--pack-5", step: "done" })],
            ["Assigned (Thrive) credits", packagesHref({ pack: "doug-hamilton--thrive-import" })],
            ["Monthly plans", packagesHref({ step: "plans" })],
            ["Plan · Mike Kenny 2/mo", packagesHref({ pack: "mike-kenny--sub-2" })],
            ["My credits", creditsHref()],
            ["Credits · after a booking", creditsHref({ extra: { demo: "after-booking" } })],
            ["Credits · spent & expired", creditsHref({ extra: { demo: "spent-expired" } })],
            ["Credits · none", creditsHref({ extra: { demo: "empty" } })],
        ],
    },
    {
        label: "Deep links (webmaster)",
        items: [
            ["Clinics at Needwood", instructionHref({ formats: ["clinic"], courses: ["needwood"] })],
            ["Monday clinics", instructionHref({ formats: ["clinic"], days: [1] })],
            ["Junior programs, weekends", instructionHref({ formats: ["junior-camp", "junior-league", "op36"], days: [0, 6] })],
            ["Beginner-friendly, Falls Road", instructionHref({ skills: ["beginner"], courses: ["falls-road"] })],
            ["Fox P3 link (courses=, numeric days)", "/instruction?courses=northwest,needwood&days=1,3&formats=clinic"],
        ],
    },
];
