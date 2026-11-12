import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountEventsScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Events",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Events** (`profile-∕-account-events--default`): events, clinics and leagues you're registered for, past registrations, and a quick-look dialog (deep link `?open=ev-2`) with Add to calendar and Cancel registration.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const path = "/account/events";
export const Desktop: Story = { render: () => <WebScreen path={path}><AccountEventsScreen /></WebScreen> };
export const EventDetails: Story = { name: "Event details", render: () => <WebScreen path={`${path}?open=ev-2`}><AccountEventsScreen /></WebScreen> };
export const Empty: Story = { render: () => <WebScreen path={path}><AccountEventsScreen events={[]} past={[]} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountEventsScreen /></WebScreen> };
