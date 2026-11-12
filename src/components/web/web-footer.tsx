import { Flag01 } from "@untitledui/icons";
import type { Course } from "@/data/crane";

/** WebFooter — course address, contact, "Powered by TenFore Golf" (matches live CraneWeb). */
export const WebFooter = ({ course }: { course: Course }) => {
    const [street, ...rest] = (course.address ?? `${course.city}, ${course.state}`).split(", ");
    return (
        <footer className="border-t border-secondary bg-primary">
            <div className="mx-auto grid max-w-web gap-8 px-4 py-10 @tablet:grid-cols-[1fr_auto_auto] @tablet:gap-16 @tablet:px-8">
                <div>
                    <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                        <Flag01 className="size-5 text-fg-brand-primary" aria-hidden="true" />
                        {course.name}
                    </div>
                    <p className="mt-3 text-md text-tertiary">
                        {street}
                        <br />
                        {rest.join(", ")}
                    </p>
                </div>
                <div>
                    <div className="caps text-quaternary">Contact</div>
                    {course.phone && <p className="mt-3 text-md text-tertiary">{course.phone}</p>}
                    {course.email && (
                        <a href={`mailto:${course.email}`} className="mt-1 block text-md font-medium text-brand-secondary hover:underline">
                            {course.email}
                        </a>
                    )}
                </div>
                <div className="@tablet:text-right">
                    <div className="caps text-quaternary">Powered by</div>
                    <p className="mt-3 text-lg font-semibold text-primary">TenFore Golf</p>
                </div>
            </div>
            <div className="mx-auto max-w-web border-t border-secondary px-4 py-5 text-sm text-quaternary @tablet:px-8">
                © 2026 {course.name}
            </div>
        </footer>
    );
};
