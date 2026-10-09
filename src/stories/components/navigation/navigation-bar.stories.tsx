import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart, Plus, Share07 } from "@untitledui/icons";
import { GlassIconButton, GlassPillButton } from "@/components/base/glass-button";
import { Screen } from "@/components/device/screen";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { CoursePhoto, ScreenFiller } from "../story-kit";

/**
 * NavigationBar — top chrome of every Crane screen, including the status-bar safe area.
 * It floats over the Screen's scroll area; the default `glass` surface blurs whatever
 * scrolls underneath (each story starts scrolled so you can see it). Root screens center
 * the title; pushed screens put it inline after the back capsule.
 */
const meta: Meta<typeof NavigationBar> = {
    title: "Components/Navigation/Navigation Bar",
    component: NavigationBar,
    parameters: { phone: true },
    args: { title: "Profile" },
    argTypes: {
        titleAlign: { control: "inline-radio", options: ["center", "inline"] },
        titleTone: { control: "inline-radio", options: ["default", "brand"] },
        surface: { control: "inline-radio", options: ["glass", "solid", "transparent"] },
        leading: { control: false },
        trailing: { control: false },
    },
    render: (args) => (
        <Screen nav={<NavigationBar {...args} />}>
            <ScreenFiller scrollBy={100} />
        </Screen>
    ),
};
export default meta;
type Story = StoryObj<typeof NavigationBar>;

/** Root screen: centered title, no back button. */
export const RootTitle: Story = { name: "Root (centered title)" };

/** Pushed screen: glass back capsule with the previous title, title inline. */
export const Pushed: Story = { name: "Pushed (back label)", args: { backLabel: "Profile", title: "Edit Profile" } };

/** Detail screens use the brand-green title. */
export const BrandTitle: Story = { name: "Brand title", args: { backLabel: "Tee Times", title: "Tee Time Details", titleTone: "brand" } };

/** Trailing glass + button (Golf Buddies → add). */
export const TrailingIcon: Story = {
    name: "Trailing + button",
    args: { backLabel: "Profile", title: "Golf Buddies" },
    render: (args) => (
        <Screen nav={<NavigationBar {...args} trailing={<GlassIconButton icon={Plus} aria-label="Add golf buddy" />} />}>
            <ScreenFiller scrollBy={100} />
        </Screen>
    ),
};

/** Trailing glass "Join" pill (waitlist). */
export const TrailingPill: Story = {
    name: "Trailing Join pill",
    args: { backLabel: "Tee Times", title: "Waitlist" },
    render: (args) => (
        <Screen nav={<NavigationBar {...args} trailing={<GlassPillButton>Join</GlassPillButton>} />}>
            <ScreenFiller scrollBy={100} />
        </Screen>
    ),
};

/** Modal stacks: chevron-only back circle with a centered title. */
export const IconOnlyBack: Story = {
    name: "Icon-only back, centered title",
    args: { backIconOnly: true, titleAlign: "center", title: "Course Info" },
};

/** Transparent over a hero image — no divider, glass buttons carry the contrast. */
export const OverImage: Story = {
    name: "Transparent over image",
    parameters: { phone: { statusBar: "light" } },
    render: () => (
        <Screen
            topInset={0}
            nav={
                <NavigationBar
                    surface="transparent"
                    divider={false}
                    backIconOnly
                    trailing={
                        <>
                            <GlassIconButton icon={Share07} aria-label="Share" />
                            <GlassIconButton icon={Heart} aria-label="Save course" />
                        </>
                    }
                />
            }
        >
            <CoursePhoto className="h-[340px]" />
            <div className="px-gutter pt-5">
                <h2 className="text-ios-title1 text-primary">Sagamore Hampton Golf Club</h2>
                <p className="mt-1 text-ios-subheadline text-tertiary">North Hampton, NH · 41 mi</p>
            </div>
            <ScreenFiller count={3} />
        </Screen>
    ),
};
