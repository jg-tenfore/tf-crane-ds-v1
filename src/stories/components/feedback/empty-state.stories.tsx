import type { Meta, StoryObj } from "@storybook/react-vite";
import { Award02, Clock, Plus, Users01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { NavigationBar } from "@/components/navigation/navigation-bar";

/**
 * EmptyState — what a list screen shows before it has content. `quiet` is a large gray
 * line icon and one gray line near the top (Memberships, Punch Cards); add a description
 * and action when there's something to do. `featured` is a brand icon in a soft circle,
 * vertically centred (Waitlist).
 */
const meta: Meta<typeof EmptyState> = {
    title: "Components/Feedback/Empty State",
    component: EmptyState,
    tags: ["autodocs"],
    parameters: { phone: true },
    args: { icon: Award02, title: "No memberships found", variant: "quiet" },
    argTypes: {
        icon: { control: false },
        action: { control: false },
        variant: { control: "inline-radio", options: ["quiet", "featured"] },
        title: { control: "text" },
        description: { control: "text" },
    },
    render: (args) => (
        <Screen nav={<NavigationBar backLabel="Profile" title="Memberships" />} contentClassName="flex flex-col">
            <EmptyState {...args} />
        </Screen>
    ),
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

/** Quiet — Memberships. */
export const Quiet: Story = {};

/** Quiet with description + action — Golf Buddies. */
export const QuietWithAction: Story = {
    name: "Quiet with action",
    args: {
        icon: Users01,
        title: "No golf buddies yet",
        description: "Add the people you play with to book tee times for them in one tap.",
        action: (
            <Button size="md" color="tinted" iconLeading={Plus}>
                Add Golf Buddy
            </Button>
        ),
    },
    render: (args) => (
        <Screen nav={<NavigationBar backLabel="Profile" title="Golf Buddies" />} contentClassName="flex flex-col">
            <EmptyState {...args} />
        </Screen>
    ),
};

/** Featured — Waitlist. */
export const Featured: Story = {
    args: {
        icon: Clock,
        variant: "featured",
        title: "No Waitlists",
        description: "Join a waitlist from a full tee time and we'll notify you if a spot opens up.",
    },
    render: (args) => (
        <Screen nav={<NavigationBar backLabel="Bookings" title="Waitlist" />} contentClassName="flex flex-col">
            <EmptyState {...args} />
        </Screen>
    ),
};
