import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { WebCoursePicker } from "@/components/web/web-course-picker";
import { WebFooter } from "@/components/web/web-footer";
import { WebHeader, type WebSection } from "@/components/web/web-header";
import { orgCourses, type WebOrg } from "@/components/web/web-org";
import { useWebRouter } from "@/components/web/web-router";
import { COURSES, courseById, USER, type Course } from "@/data/crane";
import { useCart } from "./cart-store";

interface WebSessionApi {
    course: Course;
    /** Pick a course (org sites: also leaves "any course"). Same as `selectCourse(c)`. */
    setCourse: (c: Course) => void;
    /**
     * The organization this site belongs to (e.g. MCG), or null for single-course Crane Web.
     * Set with `<WebSessionProvider org={…}>`; read with `useWebOrg()`.
     */
    org: WebOrg | null;
    /** Courses the switcher offers: the org's (in its order), or every course. */
    courses: Course[];
    /**
     * Org only: no particular course chosen ("Any MCG course"). `course` still holds a real course
     * (the last one picked, or the org's first) so single-course pages keep working.
     */
    anyCourse: boolean;
    /** Pick a course, or `null` for "any course" (org only; ignored without an org). */
    selectCourse: (c: Course | null) => void;
    /** Signed-in first name, or null for a guest. */
    userName: string | null;
    setUserName: (name: string | null) => void;
    /** Open the course-picker drawer from any page (e.g. "Select Course" on an empty tee sheet). */
    openCoursePicker: () => void;
    coursePickerOpen: boolean;
    setCoursePickerOpen: (open: boolean) => void;
}

const WebSessionContext = createContext<WebSessionApi | null>(null);

export interface WebSessionProviderProps {
    /** Starting course. Org sites default to "any course" (with the org's first course behind it). */
    courseId?: string;
    signedIn?: boolean;
    /** Organization site (multi-course tenant). Omit for single-course Crane Web. */
    org?: WebOrg | null;
    children: ReactNode;
}

/**
 * Which course the web app is on and who's signed in. Defaults to Sagamore Spring + signed-in Justin.
 * Pass `org` for an organization site: the chrome switches to the org's header, nav and footer, and the
 * course starts on "any course" unless `courseId` is given.
 */
export const WebSessionProvider = ({ courseId, signedIn = true, org = null, children }: WebSessionProviderProps) => {
    const [course, setCourseState] = useState(() => courseById(courseId ?? org?.courses[0] ?? "sagamore-spring"));
    const [anyCourse, setAnyCourse] = useState(() => !!org && !courseId);
    const [userName, setUserName] = useState<string | null>(signedIn ? USER.firstName : null);
    const [coursePickerOpen, setCoursePickerOpen] = useState(false);
    const courses = useMemo(() => (org ? orgCourses(org) : COURSES), [org]);
    const selectCourse = (c: Course | null) => {
        if (c) setCourseState(c);
        setAnyCourse(!c && !!org);
    };
    return (
        <WebSessionContext.Provider
            value={{
                course,
                setCourse: selectCourse,
                org,
                courses,
                anyCourse,
                selectCourse,
                userName,
                setUserName,
                coursePickerOpen,
                setCoursePickerOpen,
                openCoursePicker: () => setCoursePickerOpen(true),
            }}
        >
            {children}
        </WebSessionContext.Provider>
    );
};

export const useWebSession = (): WebSessionApi =>
    useContext(WebSessionContext) ?? {
        course: courseById("sagamore-spring"),
        setCourse: () => {},
        org: null,
        courses: COURSES,
        anyCourse: false,
        selectCourse: () => {},
        userName: USER.firstName,
        setUserName: () => {},
        openCoursePicker: () => {},
        coursePickerOpen: false,
        setCoursePickerOpen: () => {},
    };

/** The active organization (e.g. MCG), or null for single-course Crane Web. */
export const useWebOrg = (): WebOrg | null => useWebSession().org;

export interface WebShellProps {
    active?: WebSection;
    children: ReactNode;
    /** Hide the footer (checkout keeps the page focused). */
    footer?: boolean;
}

/**
 * WebShell — every Crane Web page: header (live cart count/total from the cart store),
 * course picker drawer, content, footer. Under an organization (`useWebOrg()`), the header,
 * section nav, course picker and footer are the org's.
 */
export const WebShell = ({ active, children, footer = true }: WebShellProps) => {
    const { course, setCourse, org, courses, anyCourse, selectCourse, userName, coursePickerOpen, setCoursePickerOpen } = useWebSession();
    const cart = useCart();
    const { navigate } = useWebRouter();

    return (
        <div className="flex min-h-full flex-col">
            <WebHeader
                course={course}
                active={active}
                cartCount={cart.count}
                cartTotal={cart.subtotal}
                userName={userName ?? undefined}
                onCourse={() => setCoursePickerOpen(true)}
                onSignIn={() => navigate("/sign-in")}
                onAccount={() => navigate("/account")}
                org={org}
                sections={org?.sections}
                anyCourse={anyCourse}
            />
            <div className="flex-1">{children}</div>
            {footer && <WebFooter course={course} org={org} />}
            <WebCoursePicker
                isOpen={coursePickerOpen}
                onOpenChange={setCoursePickerOpen}
                activeId={course.id}
                onSelect={setCourse}
                {...(org && {
                    courses,
                    title: `${org.shortName} courses`,
                    anyOption: { label: org.anyCourseLabel, detail: `All ${courses.length} courses`, active: anyCourse, onSelect: () => selectCourse(null) },
                })}
            />
        </div>
    );
};
