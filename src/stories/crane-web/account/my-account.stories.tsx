import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountMyAccountScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/My Account",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/My Account** (`profile-∕-account-my-account--default`): Airbnb-style inline edit (one row open at a time, the rest dim), payment methods with an Add card dialog. Adds the Crane app's Edit Profile fields, Appearance (System / Light / Warm Dark), Sign in to Kiosk QR and Delete Account.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const path = "/account/my-account";
export const Desktop: Story = { render: () => <WebScreen path={path}><AccountMyAccountScreen /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountMyAccountScreen /></WebScreen> };
export const EditingName: Story = { name: "Editing name", render: () => <WebScreen path={path}><AccountMyAccountScreen defaultEditing="name" /></WebScreen> };
export const AddCard: Story = { name: "Add card", render: () => <WebScreen path={path}><AccountMyAccountScreen defaultAddCardOpen /></WebScreen> };
export const AddCardMobile: Story = { name: "Add card · Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountMyAccountScreen defaultAddCardOpen /></WebScreen> };
export const DeleteAccount: Story = { name: "Delete account", render: () => <WebScreen path={path}><AccountMyAccountScreen defaultDeleteOpen /></WebScreen> };
