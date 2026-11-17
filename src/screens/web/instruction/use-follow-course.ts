import { useEffect } from "react";
import { ALL_COURSES, courseById } from "@/data/crane";
import { useWebSession } from "../web-shell";

/**
 * On an organization site, moves the header's course switcher to the course a page is about — a booking
 * at Falls Road, a Needwood clinic, a one-course instructor (decided Nov 17). Pass `undefined` when the page
 * isn't tied to one course; the header is then left as it was. Never resets the header on the way out.
 */
export const useFollowCourse = (slug: string | undefined) => {
    const { org, course, anyCourse, selectCourse } = useWebSession();
    const known = !!slug && !!org?.courses.includes(slug) && ALL_COURSES.some((c) => c.id === slug);
    useEffect(() => {
        if (known && (anyCourse || course.id !== slug)) selectCourse(courseById(slug!));
        // eslint-disable-next-line react-hooks/exhaustive-deps -- follow the page's course only
    }, [known, slug]);
};
