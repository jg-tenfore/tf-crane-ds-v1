import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";
import { CourseInfoSheet, CourseProvider, LocationsDrawer, useCourse } from "@/screens/chrome";
import { TeeSheetScreen } from "@/screens/home";

/**
 * Course switching — the hamburger opens **My Locations** (refs IMG_2192, IMG_2193);
 * the course name opens **Course info** (IMG_2194). Switching courses re-scopes the whole app.
 */
const meta: Meta = {
    title: "Prototypes/iPhone app/App Chrome/Locations",
    parameters: { phone: true },
};
export default meta;

const Open = ({ what }: { what: "drawer" | "info" }) => {
    const { setDrawerOpen, setInfoOpen } = useCourse();
    useEffect(() => {
        if (what === "drawer") setDrawerOpen(true);
        else setInfoOpen(true);
    }, [what, setDrawerOpen, setInfoOpen]);
    return null;
};

const Scene = ({ open, panel, courseId }: { open: "drawer" | "info"; panel?: "mine" | "add"; courseId?: string }) => (
    <CourseProvider initialCourseId={courseId}>
        <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
            <TeeSheetScreen />
            <TabBar items={CRANE_TABS} activeId="home" onChange={() => {}} />
            <LocationsDrawer initialPanel={panel} />
            <CourseInfoSheet />
            <Open what={open} />
        </ScreenChromeContext.Provider>
    </CourseProvider>
);

export const MyLocations: StoryObj = { name: "My Locations drawer", render: () => <Scene open="drawer" /> };
export const AddLocation: StoryObj = { name: "Add a Location", render: () => <Scene open="drawer" panel="add" /> };
export const CourseInfo: StoryObj = { name: "Course info", render: () => <Scene open="info" /> };

/** Courses with a `photo` (Laytonsville, Northwest, Falls Road, FloGolf, Kettle Hills, Memorial Park) get it as the hero, logo on top. */
export const CourseInfoWithPhoto: StoryObj = { name: "Course info · with photo", render: () => <Scene open="info" courseId="laytonsville" /> };
