import { useEffect, type ReactNode } from "react";
import { courseById } from "@/data/crane";
import { useWebSession } from "@/screens/web/web-shell";

/** Switch the session to another course before rendering (WebScreen has no courseId prop). */
export const WithCourse = ({ id, children }: { id: string; children: ReactNode }) => {
    const { course, setCourse } = useWebSession();
    useEffect(() => {
        if (course.id !== id) setCourse(courseById(id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return course.id === id ? <>{children}</> : null;
};
