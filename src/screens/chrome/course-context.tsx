import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { COURSES, courseById, type Course } from "@/data/crane";

interface CourseContextValue {
    /** The course the whole app is currently scoped to (header, tee sheet, store…). */
    course: Course;
    setCourseId: (id: string) => void;
    /** Courses saved to "My Courses" in the locations drawer. */
    saved: Course[];
    addSaved: (id: string) => void;
    removeSaved: (id: string) => void;
    /** Global overlays driven from the header. */
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
    infoOpen: boolean;
    setInfoOpen: (open: boolean) => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

/**
 * CourseProvider — Crane's global "which course am I at" state. The course header,
 * locations drawer and course info sheet all read and write it.
 */
export interface CourseProviderProps {
    initialCourseId?: string;
    /** My Courses. Defaults to the sample saved courses. */
    initialSavedIds?: string[];
    /** Fires when the active course or My Courses changes (for persistence). */
    onChange?: (state: { courseId: string; savedIds: string[] }) => void;
    children: ReactNode;
}

export const CourseProvider = ({ initialCourseId = "sagamore-hampton", initialSavedIds, onChange, children }: CourseProviderProps) => {
    const [courseId, setCourseId] = useState(initialCourseId);
    const [savedIds, setSavedIds] = useState(() => {
        const ids = initialSavedIds ?? COURSES.filter((c) => c.saved).map((c) => c.id);
        return ids.includes(initialCourseId) ? ids : [initialCourseId, ...ids];
    });
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    useEffect(() => {
        onChangeRef.current?.({ courseId, savedIds });
    }, [courseId, savedIds]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);

    const value: CourseContextValue = {
        course: courseById(courseId),
        setCourseId: (id) => {
            setCourseId(id);
            setSavedIds((s) => (s.includes(id) ? s : [...s, id]));
        },
        saved: savedIds.map(courseById),
        addSaved: (id) => setSavedIds((s) => (s.includes(id) ? s : [...s, id])),
        removeSaved: (id) => setSavedIds((s) => s.filter((x) => x !== id)),
        drawerOpen,
        setDrawerOpen,
        infoOpen,
        setInfoOpen,
    };
    return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};

/** Works without a provider too (falls back to a static default) so single-screen stories stay simple. */
export const useCourse = (): CourseContextValue => {
    const ctx = useContext(CourseContext);
    if (ctx) return ctx;
    const course = courseById("sagamore-hampton");
    return {
        course,
        setCourseId: () => {},
        saved: COURSES.filter((c) => c.saved),
        addSaved: () => {},
        removeSaved: () => {},
        drawerOpen: false,
        setDrawerOpen: () => {},
        infoOpen: false,
        setInfoOpen: () => {},
    };
};
