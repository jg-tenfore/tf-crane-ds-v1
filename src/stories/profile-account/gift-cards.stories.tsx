import type { Meta, StoryObj } from "@storybook/react-vite";
import { SAMPLE_GIFT_ORDER, SAMPLE_SELF_ORDER, SENT_GIFTS } from "@/data/gift-cards";
import { SAMPLE_PRINT_ORDER, SAMPLE_PURCHASES, WALLET_GIFT_CARDS, walletCardFrom, walletSentFrom } from "@/screens/profile";
import { ProfileStack } from "./profile-story-helpers";

const meta: Meta = {
    title: "Prototypes/iPhone app/Profile ∕ Account/Gift Cards",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Recreates **IMG_8577** (balance, code and spend categories; expired cards are dimmed) and the empty state **IMG_2189**, plus the Nov 25 gift card flow: **Buy a gift card** (the row and the **+** push the builder), card art, a green **New** pill on a card just bought, and **Sent as gifts** (Sent or Ready to print). Tapping a card opens it with its barcode and QR. The references were captured in Warm Dark — flip the toolbar Theme to compare.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <ProfileStack route="gift-cards" /> };

export const Empty: Story = { render: () => <ProfileStack route="gift-cards" params={{ cards: [], sent: [] }} /> };

/** Just bought for yourself: the success notice and the new card on top with its art and New. */
export const WithNew: Story = {
    name: "With New",
    render: () => <ProfileStack route="gift-cards" params={{ cards: [walletCardFrom(SAMPLE_SELF_ORDER), ...WALLET_GIFT_CARDS], notice: SAMPLE_PURCHASES.me }} />,
};

/** Just sent a gift: the notice, and Sent as gifts with the new one (Sent), a print-at-home one (Ready to print) and an older gift. */
export const WithSentAsGifts: Story = {
    name: "With Sent as gifts",
    render: () => (
        <ProfileStack
            route="gift-cards"
            params={{
                notice: SAMPLE_PURCHASES.gift,
                sent: [
                    walletSentFrom(SAMPLE_GIFT_ORDER),
                    { ...walletSentFrom({ ...SAMPLE_PRINT_ORDER, toFirstName: "Sam", toLastName: "Ortiz", designId: "snowy-holiday" }, "sg-print"), isNew: false, date: new Date(2026, 9, 2) },
                    ...SENT_GIFTS,
                ],
            }}
        />
    ),
};
