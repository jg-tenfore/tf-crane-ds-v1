import { createContext, useContext, useState, type ReactNode } from "react";
import { WebCoursePicker } from "@/components/web/web-course-picker";
import { WebFooter } from "@/components/web/web-footer";
import { WebHeader, type WebSection } from "@/components/web/web-header";
import { useWebRouter } from "@/components/web/web-router";
import { courseById, USER, type Course } from "@/data/crane";
import { useCart } from "./cart-store";

interface WebSessionApi {
    course: Course;
    setCourse: (c: Course) => void;
    /** Signed-in first name, or null for a guest. */
    userName: string | null;
    setUserName: (name: string | null) => void;
    /** Open the course-picker drawer from any page (e.g. "Select Course" on an empty tee sheet). */
    openCoursePicker: () => void;
    coursePickerOpen: boolean;
    setCoursePickerOpen: (open: boolean) => void;
}

const WebSessionContext = createContext<WebSessionApi | null>(null);

/** Which course the web app is on and who's signed in. Defaults to Sagamore Spring + signed-in Justin. */
export const WebSessionProvider = ({ courseId = "sagamore-spring", signedIn = true, children }: { courseId?: string; signedIn?: boolean; children: ReactNode }) => {
    const [course, setCourse] = useState(() => courseById(courseId));
    const [userName, setUserName] = useState<string | null>(signedIn ? USER.firstName : null);
    const [coursePickerOpen, setCoursePickerOpen] = useState(false);
    return (
        <WebSessionContext.Provider value={{ course, setCourse, userName, setUserName, coursePickerOpen, setCoursePickerOpen, openCoursePicker: () => setCoursePickerOpen(true) }}>
            {children}
        </WebSessionContext.Provider>
    );
};

export const useWebSession = (): WebSessionApi =>
    useContext(WebSessionContext) ?? {
        course: courseById("sagamore-spring"),
        setCourse: () => {},
        userName: USER.firstName,
        setUserName: () => {},
        openCoursePicker: () => {},
        coursePickerOpen: false,
        setCoursePickerOpen: () => {},
    };

export interface WebShellProps {
    active?: WebSection;
    children: ReactNode;
    /** Hide the footer (checkout keeps the page focused). */
    footer?: boolean;
}

/**
 * WebShell — every Crane Web page: header (live cart count/total from the cart store),
 * course picker drawer, content, footer.
 */
export const WebShell = ({ active, children, footer = true }: WebShellProps) => {
    const { course, setCourse, userName, coursePickerOpen, setCoursePickerOpen } = useWebSession();
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
            />
            <div className="flex-1">{children}</div>
            {footer && <WebFooter course={course} />}
            <WebCoursePicker isOpen={coursePickerOpen} onOpenChange={setCoursePickerOpen} activeId={course.id} onSelect={setCourse} />
        </div>
    );
};
