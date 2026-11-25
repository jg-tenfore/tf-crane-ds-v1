import { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { giftCardsHref, newGiftCardOrder, SAMPLE_GIFT_ORDER, SAMPLE_RECIPIENT, SAMPLE_SELF_ORDER, type GiftCardOrder } from "@/data/gift-cards";
import { PunchCardPage } from "@/screens/web/browse";
import { CraneWebRoutes, webRoutes } from "@/screens/web/web-app";
import { WebScreen, type WebScreenProps } from "../web-story-kit";
import { ShopStory } from "./shop-story";

/**
 * Prototypes › Crane Web › Shop › Gift Cards — the Nov 25 gift card builder at `/shop/gift-cards`,
 * mirroring Fox's "Nov 25 – New Concept" story list. Every story is a deep link rendered through the
 * app's real routes, so Add to cart goes on to the cart and the URL in the address bar keeps up as
 * you choose.
 */
const meta: Meta = {
    title: "Prototypes/Crane Web/Shop/Gift Cards",
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: [
                    "`/shop/gift-cards` — the gift card builder (Fox **Reviews › Nov 25 – Gift Cards › New Concept**, spec `tf-fox-ds-v1/docs/handoffs/2026-11-25-gift-cards-for-crane.md`).",
                    "One page in three steps: **1. Choose an amount** (deals first — $50 → $60 live, $200 → $250 a sample, $100 → $120 sold out — then $25 / $50 / $100 / $200 or any amount from $10 to $500), **2. Pick a design** (10 designs in 3 groups), **3. Who's it for?** (someone else by email or to print, or me).",
                    "Beside the steps, **Your gift card** keeps the card face, value, deal bonus and what you pay in view; below 1024 it's at the end, with a sticky bar for **Add to cart**. A gift card checks out on its own (cart kind `gift-card`) and is sent today.",
                    "Every state is a deep link: `?amount=deal-60-for-50|50|custom&custom=75&design=birthday-gift&for=someone|me&delivery=print`, plus the recipient fields, `edit=<cart line>` (Edit from the cart) and `errors=1` (field errors showing).",
                ].join("\n\n"),
            },
        },
    },
};
export default meta;
type Story = StoryObj;

/** The app's routes, so links and Add to cart work from every story. */
const Routes = () => {
    const routes = useMemo(() => webRoutes(), []);
    return <CraneWebRoutes routes={routes} />;
};

const Builder = (props: Omit<WebScreenProps, "children">) => (
    <WebScreen {...props}>
        <Routes />
    </WebScreen>
);

const at = (o: GiftCardOrder, extra = "") => `${giftCardsHref(o)}${extra && (giftCardsHref(o).includes("?") ? "&" : "?")}${extra}`;

const FILLED_IN: GiftCardOrder = { ...SAMPLE_GIFT_ORDER, toPhone: SAMPLE_RECIPIENT.phone, toPhoneConfirm: SAMPLE_RECIPIENT.phone };
const DEAL_NUDGE: GiftCardOrder = { ...newGiftCardOrder(), amount: "50" };
const CUSTOM: GiftCardOrder = {
    ...newGiftCardOrder(),
    amount: "custom",
    customAmount: "75",
    designId: "desert-canyon",
    toFirstName: "Sam",
    toLastName: "Chen",
    toEmail: "sam.chen@tenfore.golf",
    toEmailConfirm: "sam.chen@tenfore.golf",
};
const MISSING: GiftCardOrder = { ...newGiftCardOrder(), amount: "custom" };
const MISMATCH: GiftCardOrder = {
    ...FILLED_IN,
    message: "",
    toEmailConfirm: "alex.rivera@tenfore.gofl",
    toPhoneConfirm: "(617) 555-0168",
};
const PRINT: GiftCardOrder = {
    ...newGiftCardOrder(),
    delivery: "print",
    designId: "snowy-holiday",
    toFirstName: "Chris",
    toLastName: "Hale",
    message: "Merry Christmas! Tee time's on me.",
};

/** Opens on the $50 → $60 deal, the first design and "Someone else". */
export const Choose: Story = { render: () => <Builder path="/shop/gift-cards" /> };
export const ChooseLaptop: Story = { name: "Choose · Laptop", render: () => <Builder path="/shop/gift-cards" width="laptop" /> };
export const ChooseMobileWeb: Story = { name: "Choose · Mobile web", render: () => <Builder path="/shop/gift-cards" width="mobile" /> };

/** Ready to go: the deal, a design, the recipient (with a phone for the text) and a message. */
export const FilledIn: Story = { name: "Filled in", render: () => <Builder path={at(FILLED_IN)} /> };
export const FilledInLaptop: Story = { name: "Filled in · Laptop", render: () => <Builder path={at(FILLED_IN)} width="laptop" /> };
export const FilledInMobileWeb: Story = { name: "Filled in · Mobile web", render: () => <Builder path={at(FILLED_IN)} width="mobile" /> };
export const FilledInDark: Story = { name: "Filled in · Dark", render: () => <Builder path={at(FILLED_IN)} dark /> };

/** A standard $50 while the $50 → $60 deal is live: "Same $50, bigger card." */
export const DealNudge: Story = { name: "Deal nudge", render: () => <Builder path={at(DEAL_NUDGE)} /> };

/** Any amount from $10 to $500. */
export const CustomAmount: Story = { name: "Custom amount", render: () => <Builder path={at(CUSTOM)} /> };

/** Add to cart with things missing: each field says what it needs (`?errors=1`). */
export const MissingDetails: Story = { name: "Missing details", render: () => <Builder path={at(MISSING, "errors=1")} /> };

/** The confirm email and confirm phone don't match what was typed first. */
export const EmailsDontMatch: Story = { name: "Emails don't match", render: () => <Builder path={at(MISMATCH, "errors=1")} /> };

/** Buying for yourself: no recipient fields; it's saved to your wallet. */
export const ForMe: Story = { name: "For me", render: () => <Builder path={at(SAMPLE_SELF_ORDER)} /> };

/** Emailed to the buyer to print and hand over: only the recipient's name. */
export const PrintAtHome: Story = { name: "Print at home", render: () => <Builder path={at(PRINT)} /> };

/** Anyone can build a card: signed out, the From box asks for your name and email. */
export const SignedOut: Story = { name: "Signed out", render: () => <Builder path="/shop/gift-cards" signedIn={false} /> };

/* `/shop/punch-cards` lives here too (ids kept). */
export const PunchCard: Story = { name: "Punch card", render: () => <ShopStory path="/shop/punch-cards"><PunchCardPage /></ShopStory> };
export const PunchCardMobile: Story = { name: "Punch card (mobile web)", render: () => <ShopStory path="/shop/punch-cards" width="mobile"><PunchCardPage /></ShopStory> };
