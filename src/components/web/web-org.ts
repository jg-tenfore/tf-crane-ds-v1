import { ALL_COURSES, type Course } from "@/data/crane";
import type { WebSectionLink } from "./web-header";
import { matchPath } from "./web-router";

/**
 * A redirect that only applies while an organization is active. `to` may use the
 * `:params` captured by `from`, e.g. `{ from: "/clinics/:id", to: "/instruction/service/:id" }`.
 */
export interface WebOrgRedirect {
    from: string;
    to: string;
}

/**
 * WebOrg — a multi-course tenant (e.g. Montgomery County Golf: nine county courses under one
 * name, logo, nav and footer). Pass one to `WebSessionProvider` (`org` prop) and the Crane Web
 * chrome switches from the single-course header to the organization's: its logo + name, a course
 * switcher scoped to `courses` (with an "Any … course" option), its own `sections` nav and an
 * organization footer. With no org everything renders exactly as single-course Crane Web.
 *
 * Configs live in `src/data/orgs.ts` — components never hard-code a particular org.
 */
export interface WebOrg {
    id: string;
    name: string;
    shortName: string;
    /** Logo image URL (Vite asset). Shown on a white tile so it reads in dark mode too. */
    logo: string;
    /** Shown in the utility row and footer, e.g. "Montgomery County, MD". */
    location: string;
    /** Use 555 numbers in sample data. */
    phone: string;
    email: string;
    /** Course ids (from `ALL_COURSES` in src/data/crane.ts), in the organization's own order. */
    courses: string[];
    /** The section nav, in order. Ids reuse `WebSection` so pages highlight the right tab. */
    sections: WebSectionLink[];
    /** Label for the course switcher's "no particular course" option, e.g. "Any MCG course". */
    anyCourseLabel: string;
    /**
     * The org has its own home page at "/" (registered by org id in `src/screens/web/org/`).
     * Without one, "/" redirects to /tee-times like single-course Crane Web.
     */
    hasHome?: boolean;
    /** Path redirects that only apply under this org (first match wins). */
    redirects?: WebOrgRedirect[];
    /** Host for the prototype's address bar, e.g. "mcg.tenfore.golf". */
    host?: string;
    /**
     * Photos for Instruction (and later other areas). `own`: the org uploaded its own, so default
     * art only fills gaps. `defaultSet`: the TenFore default photo set picked in Buck's clinic
     * template builder (ids in `src/screens/web/instruction/data/default-art.ts`).
     */
    photos?: { own: boolean; defaultSet: string };
}

/** The org's courses as `Course` objects, in the org's order (unknown ids are skipped). */
export const orgCourses = (org: WebOrg): Course[] => org.courses.map((id) => ALL_COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c);

/** Where `path` should go under `org`, or null when no redirect applies. Query strings on `path` are ignored. */
export const resolveOrgRedirect = (org: WebOrg | null | undefined, path: string): string | null => {
    if (!org?.redirects) return null;
    for (const r of org.redirects) {
        const params = matchPath(r.from, path);
        if (params) return r.to.replace(/:([A-Za-z]+)/g, (_, k: string) => encodeURIComponent(params[k] ?? ""));
    }
    return null;
};
