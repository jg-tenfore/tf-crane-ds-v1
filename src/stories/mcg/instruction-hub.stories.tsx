import type { Meta, StoryObj } from "@storybook/react-vite";
import { McgRoute } from "./mcg-story-kit";

/**
 * MCG Instruction hub (`/instruction`) — Fox Prototype 3's one-step search, made lighter after the
 * Nov 17 call: it lands on format tiles and short result sections with a compact search · course ·
 * **Filters** bar (no lesson-credit banner, no filter wall). The full filter set (courses, format,
 * dates, days, skill set) opens behind Filters (`?expanded=1`) — a bottom sheet on mobile web. Every
 * change is written to the URL, so a webmaster link like `?formats=clinic&course=needwood&days=sat`
 * lands filtered with the panel collapsed and a one-line summary.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Instruction/Hub",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const story = (path: string, description: string, extra: Partial<Parameters<typeof McgRoute>[0]> = {}, name?: string): Story => ({
    ...(name ? { name } : {}),
    render: () => <McgRoute path={path} {...extra} />,
    parameters: { docs: { description: { story: description } } },
});

export const Desktop = story("/instruction", "Default landing: header, Services | Instructors, the compact bar, five format tiles and the first six of each section.");
export const Laptop = story("/instruction", "1024: tiles drop to a 5-up row of compact cards; results stay 3-up.", { width: "laptop" });
export const MobileWeb = story("/instruction", "390: the bar stacks (search, then course + Filters), tiles go 2-up and results 1-up.", { width: "mobile" }, "Mobile web");
export const Dark = story("/instruction", "Warm Dark: every surface, chip and badge on semantic tokens; the Academy lockup sits on a white tile.", { dark: true });
export const FiltersOpen = story("/instruction?expanded=1", "`?expanded=1`: Prototype 3's full filter set inline — courses (logos), format, dates + presets, days, skill set.", {}, "Filters open");
export const FiltersOpenMobile = story(
    "/instruction?formats=clinic&days=sat&expanded=1",
    "Mobile web: the filters open as a bottom sheet with Clear all and Show N results.",
    { width: "mobile" },
    "Filters open · mobile",
);
export const DeepLinked = story(
    "/instruction?formats=clinic&course=needwood&days=sat",
    "A webmaster link (Saturday clinics at Needwood) lands filtered with the panel collapsed: a summary line, removable chips and Edit filters.",
    {},
    "Deep-linked filtered",
);
export const DeepLinkedMobile = story("/instruction?formats=clinic&course=needwood&days=sat", "The same deep link at 390.", { width: "mobile" }, "Deep-linked · mobile");
export const NoResults = story(
    "/instruction?formats=clinic&course=needwood&days=mon",
    "Monday clinics at Needwood: nothing runs then, so the empty state offers Clear filters and Edit filters.",
    {},
    "No results",
);
export const Clinics = story("/clinics", "MCG's `/clinics` redirects here pre-filtered to the four group formats; the page titles itself \"Clinics & programs\".");
export const ClinicsMobile = story("/clinics", "Clinics & programs at 390.", { width: "mobile" }, "Clinics · mobile");
