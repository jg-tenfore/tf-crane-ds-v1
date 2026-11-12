import { useMemo, useState } from "react";
import { ToggleButton as AriaToggleButton } from "react-aria-components";
import { Check, MarkerPin01, Plus } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { SearchField } from "@/components/forms/search-field";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { useWebRouter } from "@/components/web/web-router";
import { COURSES, USER, type Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession, WebShell } from "@/screens/web/web-shell";
import { authPrimary, useNextPath, useScrollTopOnMount, withQuery } from "./auth-web-parts";

export interface ChooseHomeCoursePageProps {
    initialSelected?: string[];
    initialQuery?: string;
}

/** Nearest first; courses without a known distance go last, alphabetically. */
const byDistance = (a: Course, b: Course) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity) || a.name.localeCompare(b.name);

const CourseCard = ({ course, isSelected, onChange }: { course: Course; isSelected: boolean; onChange: (selected: boolean) => void }) => (
    <AriaToggleButton
        isSelected={isSelected}
        onChange={onChange}
        aria-label={`${course.name}, ${course.city}, ${course.state}`}
        className={cx(
            "group flex w-full cursor-pointer items-center gap-4 rounded-xl bg-primary p-4 text-left ring-1 ring-secondary outline-none ring-inset transition duration-100 ease-linear",
            "hover:ring-primary data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
            "data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand",
        )}
    >
        <CourseLogo course={course} size={52} className="rounded-xl" />
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-md font-semibold text-primary">{course.name}</span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-sm text-tertiary">
                <MarkerPin01 className="size-3.5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                {course.city}, {course.state}
                {course.distanceMi != null && ` · ${course.distanceMi} mi`}
            </span>
        </span>
        <span
            aria-hidden="true"
            className={cx(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition duration-100 ease-linear",
                isSelected ? "bg-brand-solid text-white" : "text-fg-brand-primary ring-[1.5px] ring-brand ring-inset",
            )}
        >
            {isSelected ? <Check className="size-[18px]" strokeWidth={2.6} /> : <Plus className="size-[18px]" strokeWidth={2.2} />}
        </span>
    </AriaToggleButton>
);

/**
 * Choose Home Course (/welcome/home-course) — the last step of sign-up. The app's
 * "Where do you play?" list becomes a 1 / 2 / 3-column grid of course cards with search,
 * and a sticky action bar (Skip · Continue) so the button is always in reach.
 */
export const ChooseHomeCoursePage = ({ initialSelected = [], initialQuery = "" }: ChooseHomeCoursePageProps) => {
    const { navigate } = useWebRouter();
    const { setUserName } = useWebSession();
    const next = useNextPath();
    const [query, setQuery] = useState(initialQuery);
    const [selected, setSelected] = useState<string[]>(initialSelected);
    useScrollTopOnMount();

    const courses = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...COURSES].sort(byDistance).filter((c) => !q || `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(q));
    }, [query]);

    const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...s, id] : s.filter((x) => x !== id)));
    const finish = (ids: string[]) => {
        setUserName(USER.firstName);
        navigate(withQuery("/welcome", { mode: "sign-up", courses: ids.join(","), next }));
    };

    return (
        <WebShell footer={false}>
            <WebPage className="pb-8 @tablet:pb-10">
                <PageHeader
                    eyebrow="Last step"
                    title="Where do you play?"
                    subtitle="Add the courses you play most. We’ll show their tee times first. You can change these anytime in your account."
                />
                <SearchField placeholder="Search by course, city or state" value={query} onChange={setQuery} className="mt-7 max-w-[440px]" />

                <div className="mt-8 mb-4 flex items-center gap-4">
                    <h2 className="caps shrink-0 text-quaternary">{query ? `${courses.length} result${courses.length === 1 ? "" : "s"}` : "Nearby courses"}</h2>
                    <span className="h-px flex-1 bg-border-secondary" aria-hidden="true" />
                </div>

                {courses.length > 0 ? (
                    <div className="grid gap-3 @tablet:grid-cols-2 @tablet:gap-4 @desktop:grid-cols-3">
                        {courses.map((c) => (
                            <CourseCard key={c.id} course={c} isSelected={selected.includes(c.id)} onChange={(on) => toggle(c.id, on)} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl bg-primary px-6 py-14 text-center ring-1 ring-secondary ring-inset">
                        <p className="text-lg font-semibold text-primary">No courses found</p>
                        <p className="mt-1 text-md text-tertiary">Try a course name, city or state.</p>
                    </div>
                )}
            </WebPage>

            {/* Sticky action bar */}
            <div className="sticky bottom-0 z-20 border-t border-secondary bg-primary">
                <div className="mx-auto flex max-w-web items-center gap-3 px-4 py-3 @tablet:px-8 @tablet:py-4">
                    <span className="hidden text-sm text-tertiary @tablet:block" aria-live="polite">
                        {selected.length === 0 ? "No courses selected" : `${selected.length} course${selected.length === 1 ? "" : "s"} selected`}
                    </span>
                    <Button color="outline" onPress={() => finish([])} className={cx(authPrimary, "flex-1 text-secondary @tablet:ml-auto @tablet:flex-none")}>
                        Skip for now
                    </Button>
                    <Button isDisabled={selected.length === 0} onPress={() => finish(selected)} className={cx(authPrimary, "flex-[2] @tablet:flex-none @tablet:min-w-[200px]")}>
                        {selected.length > 1 ? `Continue with ${selected.length} courses` : "Continue"}
                    </Button>
                </div>
            </div>
        </WebShell>
    );
};
