import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";
import { CourseInfoSheet, CourseProvider, LocationsDrawer } from "@/screens/chrome";
import { TeeSheetScreen } from "@/screens/home";

/** Home tab: course header, section tabs, date strip and tee sheet (refs IMG_2163, IMG_2195–2199). */
const meta: Meta = {
    title: "App Chrome/Home",
    parameters: { phone: true },
};
export default meta;

const WithChrome = ({ children }: { children: React.ReactNode }) => (
    <CourseProvider>
        <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
            {children}
            <TabBar items={CRANE_TABS} activeId="home" onChange={() => {}} />
            <LocationsDrawer />
            <CourseInfoSheet />
        </ScreenChromeContext.Provider>
    </CourseProvider>
);

export const TeeSheet: StoryObj = { name: "Tee sheet", render: () => <WithChrome><TeeSheetScreen /></WithChrome> };
export const WithCart: StoryObj = { name: "Cart with items", render: () => <WithChrome><TeeSheetScreen cartCount={2} /></WithChrome> };
export const ConfigureBooking: StoryObj = { name: "Configure Booking sheet", render: () => <WithChrome><TeeSheetScreen openTeeTimeIndex={1} /></WithChrome> };
export const BookingSummary: StoryObj = {
    name: "Booking Summary sheet",
    render: () => (
        <WithChrome>
            <TeeSheetScreen openTeeTimeIndex={1} bookingStep="summary" />
        </WithChrome>
    ),
};
