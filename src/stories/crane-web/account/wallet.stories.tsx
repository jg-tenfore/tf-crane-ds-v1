import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountWalletScreen } from "@/screens/web/account";
import { WebScreen } from "../web-story-kit";

const meta: Meta = {
    title: "Crane Web/Profile ∕ Account/Wallet",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Ports Fox **Profile ∕ Account/Wallet** (`profile-∕-account-wallet--default`, plus **Buy Gift Card** and **Punch Cards · QR**): account balance with recent activity, punch cards, gift cards and the buy-a-gift-card dialog. Adds the Crane app's Pay Balance form and Rain Checks, with the app's pale status pills (Active, Available, Used Up, Expired, Expiring Soon) and progress bars.",
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
export const BuyGiftCard: Story = { name: "Buy gift card", render: () => <WebScreen path={path}><AccountWalletScreen defaultGiftOpen /></WebScreen> };
export const MobileWeb: Story = { name: "Mobile web", render: () => <WebScreen path={path} width="mobile"><AccountWalletScreen statementBalance={48.5} /></WebScreen> };
