import type { Meta, StoryObj } from "@storybook/react-vite";
import { SAMPLE_GIFT_ORDER, SAMPLE_SELF_ORDER, newGiftCardOrder } from "@/data/gift-cards";
import { SAMPLE_PRINT_ORDER, type BuyGiftCardScreenProps } from "@/screens/profile";
import { GiftCardStack } from "./gift-card-story-helpers";

const meta: Meta = {
    title: "Prototypes/iPhone app/Profile ∕ Account/Buy a Gift Card",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Fox's Nov 25 gift card builder as a pushed iPhone screen, from Profile › Gift Cards. Three stacked steps: **amount** (deals first, a sold-out deal stays visible, the deal nudge, $25–$200 or any amount from $10 to $500), **design** (one swipeable row per group) and **who it's for** (Someone else or Me; email or print; From with Change; To; message). A sticky bottom bar keeps the card, **You pay** and **Continue** in view; errors show only after Continue. Continue opens **Review and pay** (the app's summary sheet with its saved cards); Pay swaps the builder for the confirmation.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

const Buy = (props: BuyGiftCardScreenProps) => <GiftCardStack route="buy-gift-card" params={props as Record<string, unknown>} />;

/** A new order: the $50 → $60 deal, the first design, a gift by email, from the signed-in golfer. */
export const Choose: Story = { render: () => <Buy /> };

export const FilledIn: Story = { name: "Filled in", render: () => <Buy initialOrder={SAMPLE_GIFT_ORDER} /> };

/** $50 picked while "$50 → $60" is live: "Same $50, bigger card." with Switch to the deal. */
export const DealNudge: Story = { name: "Deal nudge", render: () => <Buy initialOrder={{ ...newGiftCardOrder(), amount: "50" }} /> };

export const CustomAmount: Story = { name: "Custom amount", render: () => <Buy initialOrder={{ ...SAMPLE_GIFT_ORDER, amount: "custom", customAmount: "75" }} /> };

/** After Continue with nothing filled in: the highlighted fields and the note in the bottom bar. */
export const MissingDetails: Story = { name: "Missing details", render: () => <Buy showErrors /> };

export const ForMe: Story = { name: "For me", render: () => <Buy initialOrder={SAMPLE_SELF_ORDER} /> };

/** Email it to me to print: only the name is needed. */
export const PrintAtHome: Story = { name: "Print at home", render: () => <Buy initialOrder={SAMPLE_PRINT_ORDER} /> };

/** The summary sheet: card face, Send to, Delivery, the saved card and the totals, then Pay $50.00. */
export const ReviewAndPay: Story = { name: "Review and pay", render: () => <Buy initialOrder={SAMPLE_GIFT_ORDER} initialReview /> };

export const ReviewAndPayForMe: Story = { name: "Review and pay · For me", render: () => <Buy initialOrder={SAMPLE_SELF_ORDER} initialReview /> };

export const Dark: Story = { name: "Dark", globals: { theme: "dark" }, render: () => <Buy initialOrder={SAMPLE_GIFT_ORDER} /> };

export const DarkReviewAndPay: Story = { name: "Dark · Review and pay", globals: { theme: "dark" }, render: () => <Buy initialOrder={SAMPLE_GIFT_ORDER} initialReview /> };
