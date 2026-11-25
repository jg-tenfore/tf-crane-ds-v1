import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountWalletScreen } from "@/screens/web/account";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Prototypes/Crane Web/Profile ∕ Account/Wallet",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Wallet** (`profile-∕-account-wallet--default`, plus **Punch Cards · QR**): account balance with recent activity, punch cards and gift cards. Adds the Crane app's Pay Balance form and Rain Checks, with the app's pale status pills (Active, Available, Used Up, Expired, Expiring Soon) and progress bars. " +
                    "**Gift cards (Nov 25):** art on cards bought online, a **Sent as gifts** list, and **Buy a gift card** opens the gift card builder at `/shop/gift-cards` (it no longer opens a dialog). After a purchase see Shop › Gift Card Checkout › Wallet · gift sent / Wallet · for me.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const path = "/account/wallet";
export const Desktop: Story = { render: () => <WebScreen path={path}><AccountWalletScreen /></WebScreen> };
export const BalanceDue: Story = { name: "Balance due", render: () => <WebScreen path={path}><AccountWalletScreen statementBalance={48.5} /></WebScreen> };
export const PayBalance: Story = { name: "Pay balance", render: () => <WebScreen path={path}><AccountWalletScreen statementBalance={48.5} defaultPayOpen /></WebScreen> };
/** "Buy a gift card" now opens the builder (/shop/gift-cards) instead of a dialog: this story is the wallet on the app's router, so the button goes there. */
export const BuyGiftCard: Story = { name: "Buy gift card", render: () => <WebScreen path={path}><CraneWebRoutes routes={webRoutes()} /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountWalletScreen statementBalance={48.5} /></WebScreen> };
