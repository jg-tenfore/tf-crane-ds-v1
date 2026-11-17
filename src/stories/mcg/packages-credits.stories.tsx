import type { Meta, StoryObj } from "@storybook/react-vite";
import { creditsHref, packagesHref } from "@/screens/web/instruction/data/query";
import { McgRoute } from "./mcg-story-kit";

/**
 * Lesson packages, monthly plans and the lesson-credit wallet — Fox **Prototype 3 › Flow B
 * (Packages & Credits)** ported into Crane Web under the MCG org. Every state is a URL on
 * `/instruction/packages` (`?lessons=`, `?coach=`, `?step=plans`, `?pack=<id>&step=checkout|done`)
 * or `/instruction/credits` (`?bought=`, `?demo=`). Buying a pack calls the Instruction store's
 * `buyPack`, so the new balance is in My credits straight away.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Packages & credits",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}): Story => ({
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

const PACK = "mike-kenny--pack-5";
const PLAN = "mike-kenny--sub-2";

export const Packages: Story = story(packagesHref(), "The catalog: 9 packs from 7 instructors, filter chips, Save / Best value badges, credit dots, course chips, terms and price per lesson.");
export const PackagesLaptop: Story = { name: "Packages · Laptop", ...story(packagesHref(), "1024: two-column grid with the header actions beside the title.", { width: "laptop" }) };
export const PackagesTablet: Story = { name: "Packages · Tablet", ...story(packagesHref(), "768: two-column grid.", { width: "tablet" }) };
export const PackagesMobile: Story = { name: "Packages · Mobile web", ...story(packagesHref(), "390: one column; the size chips scroll sideways.", { width: "mobile" }) };
export const PackagesDark: Story = { name: "Packages · Dark", ...story(packagesHref(), "Dark mode — semantic tokens only; course logos stay on white.", { dark: true }) };
export const FilteredTenLessons: Story = {
    name: "Filtered to 10 lessons",
    ...story(packagesHref({ extra: { lessons: "10" } }), "`?lessons=10` — only the two 10-lesson packs (Mike Kenny, Doug Hamilton)."),
};
export const OneInstructorsPacks: Story = {
    name: "One instructor's packs",
    ...story(packagesHref({ coach: "mike-kenny" }), "`?coach=mike-kenny` — “Showing Mike Kenny's packs · Show all”, plus his monthly plan."),
};
export const PackDetail: Story = { name: "Pack detail", ...story(packagesHref({ pack: PACK }), "What's included, how it works, restrictions, the fine print as fields, and the price with its saving.") };
export const PackDetailMobile: Story = { name: "Pack detail · Mobile web", ...story(packagesHref({ pack: PACK }), "Mobile: the price and Buy sit in a sticky bottom bar.", { width: "mobile" }) };
export const AssignedPack: Story = {
    name: "Assigned pack (Thrive import)",
    ...story(packagesHref({ pack: "doug-hamilton--thrive-import" }), "Credits carried over from Thrive: terms visible, never for sale — no price, no Buy."),
};
export const Checkout: Story = { ...story(packagesHref({ pack: PACK, step: "checkout" }), "Crane's checkout pattern: contact, saved cards, what you're agreeing to, order summary, Pay.") };
export const CheckoutMobile: Story = { name: "Checkout · Mobile web", ...story(packagesHref({ pack: PACK, step: "checkout" }), "Mobile: summary first, sticky Pay bar.", { width: "mobile" }) };
export const CheckoutSignedOut: Story = {
    name: "Checkout · Signed out",
    ...story(packagesHref({ pack: PACK, step: "checkout" }), "An account is required: sign in or create one, then come back to this checkout.", { signedIn: false }),
};
export const Purchased: Story = {
    ...story(packagesHref({ pack: PACK, step: "done" }), "“5 lessons are yours” — credits added to the wallet; Book a lesson with these credits goes to Booking for Mike Kenny."),
};
export const MonthlyPlans: Story = { name: "Monthly plans", ...story(packagesHref({ step: "plans" }), "`?step=plans` — the two monthly plans, marked Concept (Fox “Model C”).") };
export const StartAPlan: Story = { name: "Start a plan", ...story(packagesHref({ pack: PLAN }), "A plan's detail: what you get, how billing works, first billing date and auto-renew (both in the URL), then checkout.") };
export const PlanCheckout: Story = { name: "Plan checkout", ...story(packagesHref({ pack: PLAN, step: "checkout" }), "The same checkout for a plan: charged on the first billing date, then monthly.") };
export const PlanStarted: Story = { name: "Plan started", ...story(packagesHref({ pack: PLAN, step: "done" }), "The plan is set up: start date, renewal notice, Book your first lesson.") };
export const MyCredits: Story = { name: "My credits", ...story(creditsHref(), "The wallet: totals, a balance per instructor (Mike Kenny's pack, Doug Hamilton's Thrive import), the loyalty-discount concept, how credits work.") };
export const MyCreditsMobile: Story = { name: "My credits · Mobile web", ...story(creditsHref(), "390: stat tiles and balances stack.", { width: "mobile" }) };
export const MyCreditsDark: Story = { name: "My credits · Dark", ...story(creditsHref(), "Dark mode.", { dark: true }) };
export const JustBought: Story = {
    name: "Credits after buying a pack",
    ...story(creditsHref({ extra: { bought: PACK } }), "`?bought=<pack>` — the confirmation's View my credits: “5 credits added” notice. (In the prototype the new balance is there too; a story starts with a fresh store.)"),
};
export const AfterABooking: Story = {
    name: "Credits after a booking",
    ...story(creditsHref({ extra: { demo: "after-booking" } }), "One credit spent with Mike Kenny: 4 of 5 left, with the redemption in the history."),
};
export const SpentAndExpired: Story = {
    name: "Spent & expired",
    ...story(creditsHref({ extra: { demo: "spent-expired" } }), "A used-up pack (buy another) and one that expired with two lessons on it (ask the Academy), plus MCG's open policy question."),
};
export const NoCredits: Story = { name: "No credits", ...story(creditsHref({ extra: { demo: "empty" } }), "Empty wallet: Browse packages / Monthly plans and how credits work.") };
