import { Flag01 } from "@untitledui/icons";
import type { Course } from "@/data/crane";
import { hasCourseBrand } from "@/screens/chrome/course-brands";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { WebOrgLogo } from "./web-header";
import { orgCourses, type WebOrg } from "./web-org";
import { WebLink } from "./web-router";

/** Organization footer (e.g. MCG): org name + location, its courses, contact, Powered by TenFore Golf. */
const OrgFooter = ({ org }: { org: WebOrg }) => (
    <footer className="border-t border-secondary bg-primary">
        <div className="mx-auto grid max-w-web gap-8 px-4 py-10 @tablet:grid-cols-[1fr_auto_auto] @tablet:gap-12 @tablet:px-8 @desktop:grid-cols-[1fr_auto_auto_auto] @desktop:gap-16">
            <div>
                <WebLink href="/" className="flex items-center gap-2.5 text-xl font-semibold text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60">
                    <WebOrgLogo org={org} />
                    {org.name}
                </WebLink>
                <p className="mt-3 text-md text-tertiary">{org.location}</p>
            </div>
            <div className="@tablet:col-span-3 @tablet:row-start-2 @desktop:col-span-1 @desktop:row-start-auto">
                <div className="caps text-quaternary">Courses</div>
                <ul className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-md text-tertiary @tablet:grid-cols-3 @desktop:grid-cols-2">
                    {orgCourses(org).map((c) => (
                        <li key={c.id}>{c.shortName}</li>
                    ))}
                </ul>
            </div>
            <div>
                <div className="caps text-quaternary">Contact</div>
                <p className="mt-3 text-md text-tertiary">{org.phone}</p>
                <a href={`mailto:${org.email}`} className="mt-1 block text-md font-medium text-brand-secondary hover:underline">
                    {org.email}
                </a>
            </div>
            <div className="@tablet:text-right">
                <div className="caps text-quaternary">Powered by</div>
                <p className="mt-3 text-lg font-semibold text-primary">TenFore Golf</p>
            </div>
        </div>
        <div className="mx-auto max-w-web border-t border-secondary px-4 py-5 text-sm text-quaternary @tablet:px-8">© 2026 {org.name}</div>
    </footer>
);

/** WebFooter — course address, contact, "Powered by TenFore Golf" (matches live CraneWeb). */
export const WebFooter = ({ course, org }: { course: Course; org?: WebOrg | null }) => {
    if (org) return <OrgFooter org={org} />;
    const [street, ...rest] = (course.address ?? `${course.city}, ${course.state}`).split(", ");
    return (
        <footer className="border-t border-secondary bg-primary">
            <div className="mx-auto grid max-w-web gap-8 px-4 py-10 @tablet:grid-cols-[1fr_auto_auto] @tablet:gap-16 @tablet:px-8">
                <div>
                    <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                        {hasCourseBrand(course) ? (
                            <CourseLogo course={course} size={32} className="rounded-md" />
                        ) : (
                            <Flag01 className="size-5 text-fg-brand-primary" aria-hidden="true" />
                        )}
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
