import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, Home02 } from "@untitledui/icons";
import { Screen } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { AppShell } from "@/components/prototype/app-shell";
import { profileScreens } from "@/screens/profile";

const Placeholder = ({ title, icon }: { title: string; icon: typeof Home02 }) => (
    <Screen nav={<NavigationBar title={title} />}>
        <EmptyState icon={icon} title={`${title} lives in another story`} description="This flow prototypes the Profile tab." />
    </Screen>
);

const meta: Meta = {
    title: "Profile ∕ Account/Flow",
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

export const Flow: Story = {
    render: () => (
        <AppShell
            initialTab="profile"
            badges={{ profile: 1 }}
            stacks={{
                home: { screens: { home: () => <Placeholder title="Home" icon={Home02} /> }, initialRoute: "home" },
                bookings: { screens: { bookings: () => <Placeholder title="Bookings" icon={Calendar} /> }, initialRoute: "bookings" },
                profile: { screens: profileScreens, initialRoute: "profile" },
            }}
        />
    ),
};
