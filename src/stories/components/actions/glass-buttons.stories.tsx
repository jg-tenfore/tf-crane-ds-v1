import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, Plus, Share07, XClose } from "@untitledui/icons";
import { BackButton, GlassIconButton, GlassPillButton } from "@/components/base/glass-button";
import { Caption, CoursePhoto, Panel } from "../story-kit";

/**
 * Liquid Glass buttons — the iOS 26 nav-bar controls. Translucent, blurred and
 * saturated, so they pick up whatever scrolls (or sits) underneath them.
 * GlassIconButton (44pt circle), GlassPillButton (text capsule) and BackButton
 * (chevron + previous screen title, or chevron only in modal stacks).
 */
const meta: Meta<typeof GlassIconButton> = {
    title: "Components/Actions/Glass Buttons",
    component: GlassIconButton,
};
export default meta;
type Story = StoryObj<typeof GlassIconButton>;

const GlassSet = () => (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-6 gap-y-5">
        <BackButton label="Profile" />
        <GlassPillButton>Join</GlassPillButton>
        <BackButton />
        <div className="flex gap-3">
            <GlassIconButton icon={Plus} aria-label="Add" />
            <GlassIconButton icon={XClose} aria-label="Close" />
        </div>
    </div>
);

const Legend = () => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <Caption>BackButton label="Profile"</Caption>
        <Caption>GlassPillButton</Caption>
        <Caption>BackButton (icon only)</Caption>
        <Caption>GlassIconButton + / ×</Caption>
    </div>
);

/** Over a course photo — the blur and saturation are what make glass legible on busy imagery. */
export const OverPhoto: Story = {
    name: "Over a photo",
    render: () => (
        <Panel className="flex w-[440px] flex-col gap-3">
            <CoursePhoto className="h-[300px] rounded-ios-card">
                {/* nav-bar arrangement, as on a hero screen */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
                    <BackButton />
                    <div className="flex gap-2">
                        <GlassIconButton icon={Share07} aria-label="Share" />
                        <GlassIconButton icon={Heart} aria-label="Save" />
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-6">
                    <GlassSet />
                </div>
            </CoursePhoto>
            <Legend />
        </Panel>
    ),
};

/** On the grouped-gray screen background — the everyday case under a nav bar. */
export const OverGroupedGray: Story = {
    name: "Over grouped gray",
    render: () => (
        <Panel className="flex w-[440px] flex-col gap-3">
            <div className="flex justify-center rounded-ios-card bg-secondary py-8 ring-1 ring-secondary">
                <GlassSet />
            </div>
            <Legend />
        </Panel>
    ),
};

/** Disabled glass buttons dim to 50%. */
export const Disabled: Story = {
    render: () => (
        <Panel className="flex items-center gap-4">
            <BackButton label="Profile" isDisabled />
            <GlassPillButton isDisabled>Join</GlassPillButton>
            <GlassIconButton icon={Plus} aria-label="Add" isDisabled />
        </Panel>
    ),
};
