import { useState } from "react";
import { ArrowLeft, CheckCircle, Plus, Star01, Trash01, MarkerPin01, XClose, Check } from "@untitledui/icons";
import { Button as AriaButton, Heading as AriaHeading } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Drawer } from "@/components/overlays/drawer";
import { SearchField } from "@/components/forms/search-field";
import { IPHONE_17 } from "@/components/device/iphone-frame";
import { COURSES, type Course } from "@/data/crane";
import { useCourse } from "./course-context";
import { CourseLogo } from "./course-logo";

const iconBtn =
    "press-scale flex size-[40px] cursor-pointer items-center justify-center rounded-full text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/** My Locations — saved courses; tap to switch the whole app to that course. */
export const MyLocationsPanel = ({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) => {
    const { course: active, saved, setCourseId, removeSaved } = useCourse();
    return (
        <>
            <div className="flex items-center justify-between border-b border-secondary px-4 pb-3" style={{ paddingTop: IPHONE_17.safeTop }}>
                <AriaHeading slot="title" className="text-ios-title3 font-bold text-primary">
                    My Locations
                </AriaHeading>
                <AriaButton aria-label="Close" onPress={onClose} className={iconBtn}>
                    <XClose className="size-6" />
                </AriaButton>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-4 py-2 text-ios-footnote font-semibold tracking-[0.06em] text-tertiary uppercase">
                <Star01 className="size-4 fill-fg-brand-primary text-fg-brand-primary" aria-hidden="true" />
                My Courses
            </div>
            <ul className="scrollbar-hide flex-1 divide-y divide-border-secondary overflow-y-auto">
                {saved.map((c) => {
                    const isActive = c.id === active.id;
                    return (
                        <li key={c.id} className={cx("flex items-center gap-2 pr-2", isActive && "bg-secondary")}>
                            <AriaButton
                                onPress={() => {
                                    setCourseId(c.id);
                                    onClose();
                                }}
                                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-3 pl-4 text-left outline-none data-[focus-visible]:bg-primary_hover data-[pressed]:bg-primary_hover"
                            >
                                {isActive && <CheckCircle className="size-5 shrink-0 fill-fg-brand-primary text-white" aria-hidden="true" />}
                                <span className="min-w-0">
                                    <span className={cx("block text-ios-headline", isActive ? "text-brand-secondary" : "text-primary")}>{c.name}</span>
                                    <span className="block text-ios-footnote text-tertiary">
                                        {c.city}, {c.state}
                                    </span>
                                </span>
                            </AriaButton>
                            <AriaButton aria-label={`Directions to ${c.name}`} className={cx(iconBtn, "size-[36px] text-fg-brand-primary")}>
                                <MarkerPin01 className="size-5" />
                            </AriaButton>
                            <AriaButton
                                aria-label={`Remove ${c.name}`}
                                isDisabled={isActive}
                                onPress={() => removeSaved(c.id)}
                                className={cx(iconBtn, "size-[36px] text-fg-quaternary disabled:opacity-40")}
                            >
                                <Trash01 className="size-5" />
                            </AriaButton>
                        </li>
                    );
                })}
            </ul>
            <div className="border-t border-secondary px-4 pt-3" style={{ paddingBottom: IPHONE_17.safeBottom + 8 }}>
                <AriaButton
                    onPress={onAdd}
                    className="press-scale flex h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-ios-control border-2 border-dashed border-brand text-ios-headline text-brand-secondary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                >
                    <Plus className="size-5" aria-hidden="true" />
                    Add a location
                </AriaButton>
            </div>
        </>
    );
};

/** Add a Location — search nearby courses and add them to My Courses. */
export const AddLocationPanel = ({ onBack, onClose }: { onBack: () => void; onClose: () => void }) => {
    const { saved, addSaved } = useCourse();
    const [query, setQuery] = useState("");
    const savedIds = new Set(saved.map((c) => c.id));
    const results = COURSES.filter((c) => c.distanceMi != null)
        .filter((c) => `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => (a.distanceMi ?? 0) - (b.distanceMi ?? 0));

    return (
        <>
            <div className="flex items-center gap-2 border-b border-secondary px-2 pb-3" style={{ paddingTop: IPHONE_17.safeTop }}>
                <AriaButton aria-label="Back to My Locations" onPress={onBack} className={iconBtn}>
                    <ArrowLeft className="size-6" />
                </AriaButton>
                <AriaHeading slot="title" className="flex-1 text-center text-ios-headline text-primary">
                    Add a Location
                </AriaHeading>
                <AriaButton aria-label="Close" onPress={onClose} className={iconBtn}>
                    <XClose className="size-6" />
                </AriaButton>
            </div>
            <div className="px-4 py-3">
                <SearchField placeholder="Search golf courses..." value={query} onChange={setQuery} />
            </div>
            <ul className="scrollbar-hide flex-1 divide-y divide-border-secondary overflow-y-auto" style={{ paddingBottom: IPHONE_17.safeBottom }}>
                {results.map((c: Course) => {
                    const added = savedIds.has(c.id);
                    return (
                        <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                            <CourseLogo course={c} size={48} className={cx(added && "opacity-50")} />
                            <span className={cx("min-w-0 flex-1", added && "opacity-50")}>
                                <span className="block text-ios-headline text-primary">{c.name}</span>
                                <span className="block text-ios-footnote text-tertiary">
                                    {c.city}, {c.state} · {c.distanceMi} mi
                                </span>
                            </span>
                            {added ? (
                                <span className="inline-flex h-[24px] items-center gap-1 rounded-md bg-fg-quaternary px-2 text-ios-caption1 font-semibold text-white">
                                    <Check className="size-3.5" aria-hidden="true" />
                                    Added
                                </span>
                            ) : (
                                <AriaButton
                                    aria-label={`Add ${c.name}`}
                                    onPress={() => addSaved(c.id)}
                                    className="press-scale flex size-[32px] cursor-pointer items-center justify-center rounded-full text-fg-brand-primary ring-2 ring-fg-brand-primary outline-none focus-visible:ring-4"
                                >
                                    <Plus className="size-5" />
                                </AriaButton>
                            )}
                        </li>
                    );
                })}
            </ul>
        </>
    );
};

/**
 * LocationsDrawer — the hamburger drawer. Two panels in one drawer:
 * My Locations ↔ Add a Location (pushes in place, like the app).
 */
export const LocationsDrawer = ({ initialPanel = "mine" }: { initialPanel?: "mine" | "add" }) => {
    const { drawerOpen, setDrawerOpen } = useCourse();
    const [panel, setPanel] = useState(initialPanel);
    return (
        <Drawer
            isOpen={drawerOpen}
            onOpenChange={(o) => {
                setDrawerOpen(o);
                if (!o) setPanel("mine");
            }}
            className="w-[75%]"
        >
            {({ close }) =>
                panel === "mine" ? <MyLocationsPanel onClose={close} onAdd={() => setPanel("add")} /> : <AddLocationPanel onBack={() => setPanel("mine")} onClose={close} />
            }
        </Drawer>
    );
};
