import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, Home02 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { AppShell } from "@/components/prototype/app-shell";
import { GiftCardsProvider, profileScreens } from "@/screens/profile";

const Placeholder = ({ title, icon }: { title: string; icon: typeof Home02 }) => (
    <Screen nav={<NavigationBar title={title} />}>
        <EmptyState icon={icon} title={`${title} lives in another story`} description="This flow prototypes the Profile tab." />
    </Screen>
);

const meta: Meta = {
    title: "Prototypes/iPhone app/Profile ∕ Account/Flow",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Fully clickable Profile tab (IMG_2170 – IMG_2191) inside the AppShell: every Profile row pushes its screen and Back pops. Home and Bookings are placeholders.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

/** The Profile tab in the AppShell, with its own gift card wallet. `stack` opens it on a sub-screen. */
const ProfileFlow = ({ stack }: { stack?: string[] }) => (
    <GiftCardsProvider>
        <AppShell
            initialTab="profile"
            badges={{ profile: 1 }}
            stacks={{
                home: { screens: { home: () => <Placeholder title="Home" icon={Home02} /> }, initialRoute: "home" },
                bookings: { screens: { bookings: () => <Placeholder title="Bookings" icon={Calendar} /> }, initialRoute: "bookings" },
                profile: { screens: profileScreens, initialRoute: "profile", initialStack: stack },
            }}
        />
    </GiftCardsProvider>
);

export const Flow: Story = { render: () => <ProfileFlow /> };

/**
 * Gift cards end to end: Gift Cards → Buy a gift card → Continue → Review and pay → Pay → the
 * confirmation → back to Gift Cards with the New card (for me) or the new row under Sent as gifts.
 * Tap a card for its barcode and QR.
 */
export const GiftCards: Story = { name: "Gift cards", render: () => <ProfileFlow stack={["profile", "gift-cards"]} /> };
