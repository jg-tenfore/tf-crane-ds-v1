import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell, type CraneTab } from "@/components/prototype/app-shell";
import { CourseInfoSheet, CourseProvider, LocationsDrawer } from "@/screens/chrome";
import { homeScreens } from "@/screens/home";
import { bookingsScreens } from "@/screens/bookings";
import { profileScreens } from "@/screens/profile";

/**
 * The whole Crane app, clickable. Global navigation is three layers:
 *
 * 1. **Tab bar** (floating Liquid Glass) — Home · Bookings · Profile. Each tab keeps its own stack.
 * 2. **Course context** — the Home header's hamburger opens *My Locations* to switch courses;
 *    tapping the course name opens course info; the cart is global.
 * 3. **Push navigation** inside each tab (glass back capsule titled with the previous screen).
 */
const meta: Meta = {
    title: "App Chrome/Global Nav",
    parameters: { phone: true },
};
export default meta;

const CraneApp = ({ initialTab = "home" }: { initialTab?: CraneTab }) => (
    <CourseProvider>
        <AppShell
            initialTab={initialTab}
            badges={{ profile: 1 }}
            stacks={{
                home: { screens: homeScreens, initialRoute: "home" },
                bookings: { screens: bookingsScreens, initialRoute: "bookings" },
                profile: { screens: profileScreens, initialRoute: "profile" },
            }}
            overlay={
                <>
                    <LocationsDrawer />
                    <CourseInfoSheet />
                </>
            }
        />
    </CourseProvider>
);

export const Prototype: StoryObj = { name: "Prototype (Home)", render: () => <CraneApp /> };
export const StartOnBookings: StoryObj = { name: "Prototype (Bookings)", render: () => <CraneApp initialTab="bookings" /> };
export const StartOnProfile: StoryObj = { name: "Prototype (Profile)", render: () => <CraneApp initialTab="profile" /> };
