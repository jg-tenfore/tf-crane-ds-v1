import { Flag01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { Course } from "@/data/crane";
import { courseBrandFor } from "./course-brands";

export interface CourseLogoProps {
    course: Course;
    size?: number;
    /**
     * Set to `circle` when the logo is shown in a round crop (a `rounded-full` class or wrapper),
     * so square marks get enough inset to keep their edges and wordmarks inside the circle.
     */
    shape?: "square" | "circle";
    className?: string;
}

/**
 * Course logo tile. Courses we have real artwork for (Sagamore, MCG and its courses, FloGolf,
 * Kettle Hills — see `course-brands.ts`, or a `course.logo` URL) show the club's logo on a white
 * tile; every other course keeps the placeholder: initials on a tinted tile, tagged
 * `data-placeholder-asset` so outstanding assets stay greppable.
 */
export const CourseLogo = ({ course, size = 56, shape = "square", className }: CourseLogoProps) => {
    const brand = courseBrandFor(course);
    const src = course.logo ?? brand?.logo;

    if (src) {
        const fit = course.logo ? "contain" : (brand?.fit ?? "contain");
        const inset = fit === "contain" ? (brand?.inset ?? 0) + (shape === "circle" ? 0.12 : 0) : 0;
        return (
            <span
                data-course-logo={brand?.id ?? course.id}
                aria-hidden="true"
                className={cx("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-secondary", shape === "circle" && "rounded-full", className)}
                style={{ width: size, height: size, padding: inset ? Math.round(size * inset) : undefined }}
            >
                <img src={src} alt="" draggable={false} className={cx("size-full", fit === "cover" ? "object-cover" : "object-contain")} />
            </span>
        );
    }

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
            className={cx(
                "inline-flex shrink-0 flex-col items-center justify-center rounded-lg bg-brand-primary_alt text-fg-brand-primary ring-1 ring-secondary",
                shape === "circle" && "rounded-full",
                className,
            )}
            style={{ width: size, height: size }}
        >
            {initials ? <span className="text-ios-headline font-bold tracking-tight">{initials}</span> : <Flag01 className="size-5" />}
        </span>
    );
};
