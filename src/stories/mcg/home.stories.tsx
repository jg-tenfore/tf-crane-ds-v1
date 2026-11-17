import type { Meta, StoryObj } from "@storybook/react-vite";
import { McgHomePage } from "@/screens/web/org";
import { McgScreen } from "./mcg-story-kit";

/**
 * MCG home (`/` under the Montgomery County Golf org). Ports Fox **Prototype 3 › Home** into
 * Crane Web: the hero quick-book across all nine courses ("Nine public courses. One tee sheet."),
 * four entry tiles, the courses as a portfolio (photo or logo, town, holes · par, weekday rate),
 * the MCG Academy with programs starting soon, and the residents banner. The header, section nav
 * (Tee Times · Shop · Events · Instruction · Calendar · Grill), course picker ("Any MCG course" +
 * the nine) and footer come from the `MCG_ORG` config, not from the page.
 */
const meta: Meta = {
    title: "Prototypes/MCG Instruction/Home",
    // Inline, not the shared MCG_STORY_PARAMETERS: Storybook only applies a literal `layout` here.
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

export const Desktop: Story = { render: () => <McgScreen path="/"><McgHomePage /></McgScreen> };
/** 1024: the org name hides beside the switcher so all six sections fit on one row. */
export const Laptop: Story = { render: () => <McgScreen path="/" width="laptop"><McgHomePage /></McgScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <McgScreen path="/" width="mobile"><McgHomePage /></McgScreen> };
export const Dark: Story = { render: () => <McgScreen path="/" dark><McgHomePage /></McgScreen> };
/** Signed out: the residents banner offers Create an account / Sign in; no lesson-credit line. */
export const Guest: Story = { render: () => <McgScreen path="/" signedIn={false}><McgHomePage /></McgScreen> };
