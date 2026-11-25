import type { Meta, StoryObj } from "@storybook/react-vite";
import { SAMPLE_PURCHASES } from "@/screens/profile";
import { GiftCardStack } from "./gift-card-story-helpers";

const meta: Meta = {
    title: "Prototypes/iPhone app/Profile ∕ Account/Gift Card Confirmation",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "After Pay, the builder is swapped for this screen (Back and Done return to Gift Cards). Same content and order as the shop's confirmation: the check, \"Thank you, Justin!\" and where the card went; the order number and card face; Items, Delivery, Payment details and **Gift card details** (the Gift Card ID masked for a gift, in full for yourself); then See it in your wallet / See your gift cards and Buy another gift card.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Gift: Story = { render: () => <GiftCardStack route="gift-card-bought" params={{ purchase: SAMPLE_PURCHASES.gift }} /> };

export const Print: Story = { name: "Print at home", render: () => <GiftCardStack route="gift-card-bought" params={{ purchase: SAMPLE_PURCHASES.print }} /> };

export const ForMe: Story = { name: "For me", render: () => <GiftCardStack route="gift-card-bought" params={{ purchase: SAMPLE_PURCHASES.me }} /> };
