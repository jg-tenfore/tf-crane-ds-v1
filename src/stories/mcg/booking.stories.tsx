import type { Meta, StoryObj } from "@storybook/react-vite";
import { bookHref, clinicById, TODAY_ISO } from "@/screens/web/instruction/data";
import { McgRoute } from "./mcg-story-kit";

/**
 * Booking (`/instruction/book`) and its confirmations (`/instruction/review`) — Fox Prototype 3's
 * Square-style flow rebuilt on Crane's tee-time checkout: the summary rail (instructor, lesson,
 * course, date/time, golfers, price, guardrails) beside each step — Date & time (date strip + Morning
 * / Afternoon / Evening board, waitlist), Details (golfers, questions, extras, note), Sign in (guests
 * only), Payment (lesson credit, saved cards, pay at the lesson, promo) and Review & confirm. Group
 * programs register instead (sessions, participants with age rules, spots left, waitlist when full).
 *
 * Every step is in the URL — `step`, `date`, `time`, `players` (+ `extras`, `pay`, `promo`,
 * `sessions`) — so each story below is a deep link. Under 1024 the rail collapses into a summary
 * panel and the action pins to the bottom with the total, like the tee-time checkout.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Booking",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}, name?: string): Story => ({
    ...(name ? { name } : {}),
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

const MK = { coach: "mike-kenny", service: "private-45", course: "falls-road" };
const AT = { ...MK, date: "2026-10-09", time: "09:00" };
const book = (patch: Partial<Parameters<typeof bookHref>[0]> = {}, extra = "") => `${bookHref({ ...MK, ...patch })}${extra}`;

export const PickALessonFirst = story(
    "/instruction/book",
    "Opened with no lesson chosen: Fox's cold start — Choose an instructor, or Browse clinics instead.",
    {},
    "Pick a lesson first",
);
export const TimeBoard = story(
    book(),
    "Date & time for Mike Kenny's 45-minute private at Falls Road: Lesson · Course · Golfers bar, a week of days with open counts, booked and unavailable times struck through.",
    {},
    "Time board",
);
export const TimeSelected = story(book({ date: AT.date, time: AT.time }), "A time picked (from `?date=&time=`): the summary fills in and Continue lights up.", {}, "Time selected");
export const AnyInstructor = story(
    bookHref({ coach: "any", service: "private-60", course: "needwood" }),
    "“Any available instructor” at Needwood: every pro on one board, each open time tagged with who is free.",
    {},
    "Any instructor",
);
export const DayFull = story(
    bookHref({
        coach: "mike-kenny",
        service: "junior-30",
        course: "falls-road",
        date: "2026-10-09",
    }),
    "A junior private on a Friday — weekends only, so nothing is open: the next opening and Join the waitlist instead of a dead end.",
    {},
    "Nothing open that day",
);
export const Waitlist = story(
    book({ step: "waitlist" }),
    "The waitlist: date range, times of day, days of the week, where to reach you. Nothing is charged until a slot is accepted.",
);
export const Details = story(
    book({ ...AT, players: 2, step: "details" }),
    "Details: golfers (price for the whole group, each shown), golfer 2 pre-filled from a sample guest, “What would you like to work on?”, sample extras and a note.",
);
export const SignInGate = story(
    book({ ...AT, step: "payment" }),
    "Signed out: payment needs an account, so the step becomes an inline sign-in (or the full Crane sign-in page via `?next=`). Nothing chosen is lost.",
    { signedIn: false },
    "Sign-in gate (guest)",
);
export const PaymentWithCredit = story(
    book({ ...AT, step: "payment" }, "&pay=credit"),
    "Payment with a lesson credit (`creditsFor` finds Mike Kenny's 5-pack): the credit covers the lesson; the $4 facility fee still goes on the card on file, as in Fox.",
    {},
    "Payment with credit",
);
export const PaymentWithPromo = story(
    book({ ...AT, step: "payment" }, "&promo=WELCOME10&extras=range-bucket"),
    "Card payment with WELCOME10 applied (10% off the lesson) and a range bucket extra.",
    {},
    "Payment with promo",
);
export const ReviewAndConfirm = story(
    book({ ...AT, step: "confirm" }, "&pay=credit&extras=video-review"),
    "Review & confirm: lesson, golfers, extras and payment, each with Change. Confirm books it, spends the credit and goes to the confirmation.",
    {},
    "Review & confirm",
);
export const GroupProgram = story(
    bookHref({
        coach: "mike-kenny",
        service: "clinic-adult-l2",
        course: "falls-road",
    }),
    "Registering for Mike Kenny's Adult Level 2 clinic: banner, instructor, schedule, spots left, every session, who it's for and what to bring, then participants.",
    {},
    "Group program registration",
);
export const GroupParticipants = story(
    bookHref({
        coach: "kate-schanuel",
        service: "clinic-junior-first",
        course: "crossvines",
        players: 2,
        step: "details",
    }),
    "A junior program (ages 7–10): each participant's date of birth is checked against the first session — one sample child is too old and the registration is blocked with the reason.",
    {},
    "Program participants (age rules)",
);
export const PickYourDates = story(
    `${bookHref({ coach: "any", service: "short-game-school-needwood", course: "needwood" })}&sessions=${(clinicById("short-game-school-needwood")?.sessionDates ?? [])
        .filter((d) => d >= TODAY_ISO)
        .slice(0, 3)
        .join(",")}`,
    "A county clinic sold by the session: three dates chosen (`sessions=`), so Buy 3 get 50% off applies to the whole registration.",
    {},
    "County clinic · pick your dates",
);
export const ProgramFull = story(
    bookHref({
        coach: "brent-wilkerson",
        service: "clinic-wedge",
        course: "needwood",
        step: "waitlist",
    }),
    "The Wedge Matrix Workshop is full: join the program's waitlist instead.",
    {},
    "Program full → waitlist",
);
export const Confirmation = story(
    `/instruction/review?coach=mike-kenny&service=private-45&course=falls-road&date=2026-10-09&time=09:00&players=1&step=booked&confirmation=MCG-48213&pay=pm-amex&extras=video-review`,
    "“You're booked”: summary and payment, add to calendar, what to bring, the 24-hour cancellation window, manage links and the pack prompt.",
);
export const CreditConfirmation = story(
    `/instruction/review?coach=mike-kenny&service=private-45&course=falls-road&date=2026-10-09&time=09:00&players=1&step=booked&confirmation=MCG-48213&pay=credit&credit=1`,
    "Booked with a lesson credit: the credit covers the lesson, the $4 facility fee goes on the card on file, and the credits left with Mike Kenny.",
    {},
    "Confirmation · credit",
);
export const WaitlistConfirmation = story(
    `/instruction/review?coach=mike-kenny&service=private-45&course=falls-road&date=2026-10-09&players=1&step=waitlisted&confirmation=WL-10421&window=Oct 9 – Nov 6 · evening · Mon, Wed`,
    "On the waitlist: the window asked for, what happens next, leave the waitlist.",
    {},
    "Waitlist confirmation",
);
export const RegistrationConfirmation = story(
    `/instruction/review?coach=mike-kenny&service=clinic-adult-l2&course=falls-road&players=1&step=registered&confirmation=REG-20931&paid=189.00&pay=pm-amex`,
    "Registered for a group program: every session date, what to bring and what's provided, cancellation.",
    {},
    "Registration confirmation",
);
export const RateALesson = story(
    "/instruction/review?coach=mike-kenny&service=private-45&course=falls-road&date=2026-10-02",
    "Without a confirmation, `/instruction/review` is Fox's post-lesson review: verified, initials only, moderated.",
    {},
    "Rate a completed lesson",
);
export const MobileWeb = story(
    book(),
    "390: the summary collapses into a panel at the top and Continue pins to the bottom with the price.",
    { width: "mobile" },
    "Mobile web · time",
);
export const MobilePayment = story(
    book({ ...AT, step: "payment" }, "&pay=credit"),
    "390 payment: payment rows full width, total and Review booking in the sticky bar.",
    { width: "mobile" },
    "Mobile web · payment",
);
export const Tablet = story(book({ ...AT, step: "details" }), "768: one column, summary panel on top.", { width: "tablet" });
export const Dark = story(book({ date: AT.date, time: AT.time }), "Warm Dark: open, selected, booked and unavailable slots all readable.", { dark: true });
export const DarkPayment = story(book({ ...AT, step: "payment" }, "&pay=credit&promo=WELCOME10"), "Warm Dark payment.", { dark: true }, "Dark · payment");
export const Flow = story(
    "/instruction/pro/mike-kenny",
    "Clickable: start on Mike Kenny's profile → Book a lesson → pick a time → details → payment (try the credit) → confirm → the confirmation; the spent credit shows under Lesson credits.",
);
