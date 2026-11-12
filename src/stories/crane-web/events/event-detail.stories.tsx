import type { Meta, StoryObj } from "@storybook/react-vite";
import { EventDetailPage } from "@/screens/web/events";
import { WebScreen } from "../web-story-kit";

/**
 * `/events/:id` — ports Fox **Global Nav/Events/Event Details** (`events-detail.stories.tsx`: default,
 * clinic, charity, registered). Hero, about / what's included / details / where / know before you go,
 * and a sticky register card. Crane adds who's playing (you + buddies + guests, with guest pricing),
 * team events, members-only, charity donations and fundraising progress, the waitlist when full,
 * and a confirmation dialog with Add to calendar and Share. On mobile web the card moves under the
 * title and a sticky Register bar stays at the bottom.
 */
const meta: Meta = {
    title: "Crane Web/Events/Event Details",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const at = (id: string) => `/events/${id}`;

export const Desktop: Story = { render: () => <WebScreen path={at("fall-foliage-scramble")}><EventDetailPage id="fall-foliage-scramble" /></WebScreen> };
export const MobileWeb: Story = {
    name: "Mobile web",
    render: () => <WebScreen path={at("fall-foliage-scramble")} width="mobile"><EventDetailPage id="fall-foliage-scramble" /></WebScreen>,
};
export const WithGuests: Story = {
    name: "Players · buddies + guest",
    render: () => (
        <WebScreen path={at("fall-foliage-scramble")}>
            <EventDetailPage id="fall-foliage-scramble" initialBuddies={["u-2", "u-3"]} initialGuests={1} />
        </WebScreen>
    ),
};
export const RegistrationDialog: Story = {
    name: "Registration dialog",
    render: () => (
        <WebScreen path={at("fall-foliage-scramble")}>
            <EventDetailPage id="fall-foliage-scramble" initialBuddies={["u-2"]} initialGuests={1} initialStep="confirm" />
        </WebScreen>
    ),
};
export const RegistrationDone: Story = {
    name: "Registration dialog · Done",
    render: () => (
        <WebScreen path={at("fall-foliage-scramble")}>
            <EventDetailPage id="fall-foliage-scramble" initialBuddies={["u-2"]} initialStep="done" initialRegistered />
        </WebScreen>
    ),
};
export const Registered: Story = {
    render: () => (
        <WebScreen path={at("fall-foliage-scramble")}>
            <EventDetailPage id="fall-foliage-scramble" initialBuddies={["u-2"]} initialRegistered />
        </WebScreen>
    ),
};
export const CharityFewSpots: Story = {
    name: "Charity · Few spots",
    render: () => <WebScreen path={at("rally-for-the-cure")}><EventDetailPage id="rally-for-the-cure" /></WebScreen>,
};
export const FullWaitlist: Story = {
    name: "Full · Waitlist",
    render: () => <WebScreen path={at("twilight-nine-and-wine")}><EventDetailPage id="twilight-nine-and-wine" /></WebScreen>,
};
export const FullWaitlistDialog: Story = {
    name: "Full · Waitlist dialog",
    render: () => <WebScreen path={at("twilight-nine-and-wine")}><EventDetailPage id="twilight-nine-and-wine" initialStep="confirm" /></WebScreen>,
};
export const MobileWaitlist: Story = {
    name: "Mobile web · Waitlist",
    render: () => <WebScreen path={at("glow-ball-nine")} width="mobile"><EventDetailPage id="glow-ball-nine" /></WebScreen>,
};
export const MembersOnlyTeam: Story = {
    name: "Members only · Team event",
    render: () => <WebScreen path={at("member-guest-invitational")}><EventDetailPage id="member-guest-invitational" /></WebScreen>,
};
export const MembersOnlySignedOut: Story = {
    name: "Members only · Signed out",
    render: () => <WebScreen path={at("member-guest-invitational")} signedIn={false}><EventDetailPage id="member-guest-invitational" /></WebScreen>,
};
export const Free: Story = {
    name: "Free · Juniors",
    render: () => <WebScreen path={at("junior-halloween-chip-putt")}><EventDetailPage id="junior-halloween-chip-putt" /></WebScreen>,
};
