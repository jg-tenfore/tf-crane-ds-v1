import { Flag01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { Course } from "@/data/crane";

/**
 * Placeholder course logo: initials on a tinted tile. Real club logos come from the
 * course's CMS record in production; tagged so outstanding assets stay greppable.
 */
export const CourseLogo = ({ course, size = 56, className }: { course: Course; size?: number; className?: string }) => {
    const initials = course.name
        .replace(/[^A-Za-z ]/g, "")
        .split(" ")
        .filter((w) => w.length > 2 && !["Golf", "Club", "Course", "Country", "The"].includes(w))
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
    return (
        <span
            data-placeholder-asset="course-logo"
            aria-hidden="true"
            className={cx("inline-flex shrink-0 flex-col items-center justify-center rounded-lg bg-brand-primary_alt text-fg-brand-primary ring-1 ring-secondary", className)}
            style={{ width: size, height: size }}
        >
            {initials ? <span className="text-ios-headline font-bold tracking-tight">{initials}</span> : <Flag01 className="size-5" />}
        </span>
    );
};
