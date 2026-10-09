import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, MarkerPin01, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { CourseHeader } from "@/components/navigation/course-header";
import { Drawer } from "@/components/overlays/drawer";
import { COURSES } from "@/data/crane";
import { ScreenFiller } from "../story-kit";

/**
 * Drawer — a leading-edge side panel (~75% width) over a dimmed screen. Crane uses it for
 * the course switcher ("My Locations"), opened from the hamburger in the CourseHeader.
 * Tap the scrim or press Escape to close. Opens on load; the hamburger reopens it.
 */
const meta: Meta<typeof Drawer> = {
    title: "Components/Overlays/Drawer",
    component: Drawer,
    parameters: { phone: true },
};
export default meta;
type Story = StoryObj<typeof Drawer>;

const MyLocationsDemo = () => {
    const [open, setOpen] = useState(true);
    const [courseId, setCourseId] = useState("sagamore-hampton");
    const active = COURSES.find((c) => c.id === courseId)!;
    const saved = COURSES.filter((c) => c.saved || c.id === courseId);
    return (
        <Screen nav={<CourseHeader courseName={active.name} city={active.city} onMenu={() => setOpen(true)} />}>
            <ScreenFiller count={6} />
            <Drawer isOpen={open} onOpenChange={setOpen} aria-label="My Locations">
                {({ close }) => (
                    <>
                        <div className="px-5 pt-[70px] pb-3">
                            <h2 className="text-ios-title1 text-primary">My Locations</h2>
                        </div>
                        <ul className="scrollbar-hide flex-1 overflow-y-auto">
                            {saved.map((c) => {
                                const selected = c.id === courseId;
                                return (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCourseId(c.id);
                                                close();
                                            }}
                                            className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition duration-100 ease-linear active:bg-primary_hover"
                                        >
                                            <MarkerPin01 className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className={selected ? "truncate text-ios-headline text-brand-secondary" : "truncate text-ios-body text-primary"}>{c.name}</span>
                                                <span className="text-ios-footnote text-tertiary">
                                                    {c.city}, {c.state}
                                                    {c.distanceMi ? ` · ${c.distanceMi} mi` : ""}
                                                </span>
                                            </span>
                                            {selected && <Check className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="border-t border-secondary px-5 pt-3 pb-[42px]">
                            <Button fullWidth color="tinted" size="md" iconLeading={Plus}>
                                Find a Course
                            </Button>
                        </div>
                    </>
                )}
            </Drawer>
        </Screen>
    );
};

/** Course switcher, open on load. Pick a course to switch and close. */
export const MyLocations: Story = { name: "My Locations", render: () => <MyLocationsDemo /> };
