import type { Meta, StoryObj } from "@storybook/react-vite";
import { SAMPLE_SELF_ORDER } from "@/data/gift-cards";
import { walletCardFrom } from "@/screens/profile";
import { GiftCardStack } from "./gift-card-story-helpers";

const meta: Meta = {
    title: "Prototypes/iPhone app/Profile ∕ Account/Gift Card Detail",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Tapping a card in Profile › Gift Cards. The card face and balance, then the **Gift Card ID** as a scannable **UPC-A barcode** and **QR code** for the Pro Shop counter (always black on white, in both modes), what it's good for and \"Doesn't expire\". Older cards without a 12-digit ID show the QR only.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

/** The $60 card just bought for yourself (Gift Card ID 2847 1609 3352). */
export const Default: Story = { name: "Barcode + QR", render: () => <GiftCardStack route="gift-card" params={{ card: walletCardFrom(SAMPLE_SELF_ORDER) }} /> };

/** An older card from before designs and 12-digit IDs: the QR only. */
export const OlderCard: Story = { name: "Older card (QR only)", render: () => <GiftCardStack route="gift-card" params={{ id: "gc-1" }} /> };

export const UsedUp: Story = { name: "Used up", render: () => <GiftCardStack route="gift-card" params={{ id: "gc-2" }} /> };

export const Dark: Story = { name: "Dark", globals: { theme: "dark" }, render: () => <GiftCardStack route="gift-card" params={{ card: walletCardFrom(SAMPLE_SELF_ORDER) }} /> };
