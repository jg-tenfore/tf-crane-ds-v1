import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppAppearancePage, LOW_RES_SAMPLE_ID } from "@/screens/buck/app-appearance-page";

/**
 * Buck's "App appearance" page: where a course customizes its white-label Crane app (Nov 24, 2026 call).
 * Four curated dials, never a free-for-all: one of 12 tuned palettes, one hero photo with guardrails
 * (or a TenFore default photo), the logo and name, and an announcements feed. Changes go to TenFore for
 * a design review before they're published (Weston's idea); announcements go live right away.
 *
 * Pick any of the five sample clubs in the top bar to load its profile. Everything is local state.
 *
 * The live preview is the themed club home (`ClubHomePreview`, src/screens/club): palette, photo and
 * focus point, name, tagline and feed all show as you edit, in light or dark.
 */
const meta = {
    title: "Explorations/Club customization/App appearance (Buck)",
    component: AppAppearancePage,
    parameters: { layout: "fullscreen" },
    argTypes: { renderPreview: { control: false } },
} satisfies Meta<typeof AppAppearancePage>;
export default meta;
type Story = StoryObj<typeof meta>;

/* Each club ---------------------------------------------------------- */

/** Sagamore Spring: Pine palette, no photo uploaded yet, so the app shows TenFore's default photos. */
export const Default: Story = { name: "Sagamore Spring (default)" };

export const ClubMcg: Story = { name: "Club · MCG", args: { clubId: "falls-road" } };

export const ClubKettleHills: Story = { name: "Club · Kettle Hills", args: { clubId: "kettle-hills" } };

export const ClubMemorialPark: Story = { name: "Club · Memorial Park", args: { clubId: "memorial-park" } };

export const ClubFloGolf: Story = { name: "Club · FloGolf", args: { clubId: "flogolf" } };

/* States -------------------------------------------------------------- */

/** The selected palette's contrast checks, each with its ratio, the minimum and a sample. */
export const PaletteChecksExpanded: Story = {
    name: "State · Palette checks expanded",
    args: { initialChecksOpen: true, focusSection: "palette" },
};

/** Kettle Hills "uploads" a 480 px copy of its photo: the low-resolution warning. */
export const LowResolutionPhoto: Story = {
    name: "State · Low-res photo warning",
    args: { clubId: "kettle-hills", initialHero: { source: "upload", uploadId: LOW_RES_SAMPLE_ID }, focusSection: "hero" },
};

/** Memorial Park switches to a TenFore photo: Evening links, second photo. */
export const DefaultPhotoSetChosen: Story = {
    name: "State · TenFore photo set chosen",
    args: { clubId: "memorial-park", initialHero: { source: "tenfore", setId: "evening-links", setPhoto: 1 }, focusSection: "hero" },
};

/** Kettle Hills moves the focus point down to the fairway, and the phone crop follows it. */
export const FocusPointMoved: Story = {
    name: "State · Focus point moved",
    args: { clubId: "kettle-hills", initialHero: { focus: { x: 0.5, y: 0.95 } }, focusSection: "hero" },
};

export const NewPostComposerOpen: Story = {
    name: "State · New post composer open",
    args: {
        focusSection: "announcements",
        initialComposer: {
            kind: "course",
            title: "Course closed Thanksgiving Day",
            body: "The course and pro shop are closed Thursday, Nov 26. Tee sheets for Friday open as usual at 7 AM.",
            withButton: true,
            buttonId: "book",
            expiry: "month",
        },
    },
};

/** Sagamore tries Claret and submits it: Publish waits for TenFore's approval. */
export const SubmittedForReview: Story = {
    name: "State · Submitted for review",
    args: { initialPaletteId: "claret", initialStatus: "in-review" },
};

export const DarkPreview: Story = {
    name: "State · Dark preview",
    args: { initialDark: true },
};

/** The preview's Home / Feed toggle on Feed: the club's announcements as golfers see them. */
export const FeedPreview: Story = {
    name: "State · Preview on the feed",
    args: { clubId: "flogolf", initialPreviewScreen: "feed", focusSection: "announcements" },
};

/** After TenFore approves, Publish unlocks. */
export const ReviewApproved: Story = {
    name: "State · Review approved",
    args: { initialPaletteId: "claret", initialStatus: "approved" },
};

/** The variant without Weston's review step: Publish is available as soon as there are changes. */
export const PublishWithoutReview: Story = {
    name: "Variant · No review step",
    args: { clubId: "memorial-park", initialPaletteId: "harbor", reviewRequired: false },
};
