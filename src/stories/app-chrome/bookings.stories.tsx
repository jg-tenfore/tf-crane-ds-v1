import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";
import { StackNavigator } from "@/components/prototype/stack-navigator";
import { BookingsScreen, PurchaseDetailsScreen, TeeTimeDetailsScreen, bookingsScreens } from "@/screens/bookings";

/** Bookings tab and its detail screens (refs IMG_2164–2169). */
const meta: Meta = {
    title: "App Chrome/Bookings",
    parameters: { phone: true },
};
export default meta;

const Tabbed = ({ children }: { children: React.ReactNode }) => (
    <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
        {children}
        <TabBar items={CRANE_TABS.map((t) => ({ ...t, badge: t.id === "profile" ? 1 : undefined }))} activeId="bookings" onChange={() => {}} />
    </ScreenChromeContext.Provider>
);

export const Reservations: StoryObj = { render: () => <Tabbed><BookingsScreen /></Tabbed> };
export const Purchases: StoryObj = { render: () => <Tabbed><BookingsScreen initialTab="purchases" /></Tabbed> };
export const Empty: StoryObj = { name: "Reservations · empty", render: () => <Tabbed><BookingsScreen empty /></Tabbed> };
export const TeeTimeDetailsPast: StoryObj = { name: "Tee Time Details · expired", render: () => <Tabbed><TeeTimeDetailsScreen id="b-2" /></Tabbed> };
export const TeeTimeDetailsUpcoming: StoryObj = { name: "Tee Time Details · upcoming", render: () => <Tabbed><TeeTimeDetailsScreen id="b-1" /></Tabbed> };
export const PurchaseDetails: StoryObj = { name: "Purchase Details", render: () => <Tabbed><PurchaseDetailsScreen /></Tabbed> };
export const Flow: StoryObj = {
    name: "Flow (clickable)",
    render: () => (
        <Tabbed>
            <StackNavigator screens={bookingsScreens} initialRoute="bookings" />
        </Tabbed>
    ),
};
