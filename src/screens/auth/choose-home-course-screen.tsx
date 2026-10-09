import { useMemo, useState } from "react";
import { ToggleButton as AriaToggleButton } from "react-aria-components";
import { Check, Flag01, Plus } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Screen } from "@/components/device/screen";
import { Button } from "@/components/base/button";
import { GlassPillButton } from "@/components/base/glass-button";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { SearchField } from "@/components/forms/search-field";
import { ListGroup } from "@/components/lists/list";
import { useStack } from "@/components/prototype/stack-navigator";
import { COURSES, type Course } from "@/data/crane";
import { AuthFooter, AuthTitle } from "./auth-parts";

export interface ChooseHomeCourseScreenProps {
    initialSelected?: string[];
    initialQuery?: string;
    /** Called with the chosen course ids. Defaults to pushing "signed-in". */
    onContinue?: (courseIds: string[]) => void;
}

/** Nearest first; courses without a known distance go last, alphabetically. */
const byDistance = (a: Course, b: Course) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity) || a.name.localeCompare(b.name);

const CourseRow = ({ course, isSelected, onChange }: { course: Course; isSelected: boolean; onChange: (selected: boolean) => void }) => (
    <AriaToggleButton
        isSelected={isSelected}
        onChange={onChange}
        aria-label={`${course.name}, ${course.city}, ${course.state}`}
        className="group flex min-h-[68px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left outline-none transition duration-100 ease-linear data-[pressed]:bg-primary_hover data-[focus-visible]:bg-primary_hover"
    >
        {/* Course logo placeholder — matches the app's flag tile for courses without artwork. */}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-secondary ring-1 ring-secondary ring-inset">
            <Flag01 className="size-5 text-fg-quaternary" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-ios-headline text-primary">{course.name}</span>
            <span className="truncate text-ios-subheadline text-tertiary">
                {course.city}, {course.state}
                {course.distanceMi != null && ` · ${course.distanceMi} mi`}
            </span>
        </span>
        <span
            aria-hidden="true"
            className={cx(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition duration-100 ease-linear",
                isSelected ? "bg-brand-solid text-white" : "border-[1.5px] border-brand text-fg-brand-primary",
            )}
        >
            {isSelected ? <Check className="size-[18px]" strokeWidth={2.6} /> : <Plus className="size-[18px]" strokeWidth={2.2} />}
        </span>
    </AriaToggleButton>
);

/**
 * Choose Home Course — the last step of sign-up. Mirrors the app's "Add a Location" picker:
 * search, a list of nearby courses with + / ✓ toggles, Continue once at least one is picked.
 */
export const ChooseHomeCourseScreen = ({ initialSelected = [], initialQuery = "", onContinue }: ChooseHomeCourseScreenProps) => {
    const { push } = useStack();
    const [query, setQuery] = useState(initialQuery);
    const [selected, setSelected] = useState<string[]>(initialSelected);

    const courses = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...COURSES].sort(byDistance).filter((c) => !q || `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(q));
    }, [query]);

    const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
    const finish = (ids: string[]) => (onContinue ? onContinue(ids) : push("signed-in", { mode: "sign-up", courses: ids }));

    return (
        <Screen
            nav={
                <NavigationBar
                    title="Home Course"
                    trailing={<GlassPillButton onPress={() => finish([])}>Skip</GlassPillButton>}
                    leading={<span className="w-[68px]" />}
                />
            }
            footer={
                <AuthFooter>
                    <Button color="filled" fullWidth isDisabled={selected.length === 0} onPress={() => finish(selected)}>
                        {selected.length > 1 ? `Continue with ${selected.length} Courses` : "Continue"}
                    </Button>
                </AuthFooter>
            }
        >
            <AuthTitle title="Where do you play?" subtitle="Add the courses you play most. You can change these anytime in Profile." className="pt-4" />

            <div className="mt-5 px-gutter">
                <SearchField placeholder="Search golf courses…" value={query} onChange={setQuery} />
            </div>

            {courses.length > 0 ? (
                <ListGroup header={query ? `${courses.length} result${courses.length === 1 ? "" : "s"}` : "Nearby"} className="mt-5">
                    {courses.map((c) => (
                        <CourseRow key={c.id} course={c} isSelected={selected.includes(c.id)} onChange={(on) => toggle(c.id, on)} />
                    ))}
                </ListGroup>
            ) : (
                <div className="px-gutter pt-12 text-center">
                    <p className="text-ios-headline text-primary">No courses found</p>
                    <p className="mt-1 text-ios-subheadline text-tertiary">Try a course name, city or state.</p>
                </div>
            )}
        </Screen>
    );
};
