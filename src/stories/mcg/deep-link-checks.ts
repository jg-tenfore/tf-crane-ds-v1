/**
 * Sanity checks for the MCG Instruction foundation: the URL model, org redirects and the ported
 * data. Run by the "Foundation / Deep links" story — any failure throws, so `npm test` (which
 * mounts every story) fails too.
 */
import { resolveOrgRedirect } from "@/components/web/web-org";
import { GROUP_PROGRAMS_PATH, MCG_ORG } from "@/data/orgs";
import {
    ALL_OFFERINGS,
    bookHref,
    clinicsHref,
    COACHES,
    dateOfIso,
    filterOfferings,
    GROUP_SERVICES,
    instructionHref,
    instructorProfile,
    MCG_CLINICS,
    offeringById,
    offeringsAt,
    parseInstructionQuery,
    proHref,
    queryToFilter,
    REBASE_DAYS,
    serializeInstructionQuery,
    serviceById,
    serviceHref,
    splitPath,
    TODAY_ISO,
    withQuery,
} from "@/screens/web/instruction/data";

export interface Check {
    label: string;
    ok: boolean;
    detail?: string;
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const check = (label: string, ok: boolean, detail?: unknown): Check => ({ label, ok, detail: detail === undefined ? undefined : typeof detail === "string" ? detail : JSON.stringify(detail) });

/** Re-serialize a link from its parsed form: the canonical link must parse back to the same query. */
export const roundTrip = (href: string) => {
    const { pathname, query } = splitPath(href);
    const canonical = withQuery(pathname, query);
    return { canonical, ok: eq(splitPath(canonical).query, query) };
};

export const runChecks = (paths: string[]): Check[] => {
    const q = parseInstructionQuery;
    const needwoodClinics = filterOfferings(queryToFilter(q("/instruction?formats=clinic&course=needwood")));
    const adultL2 = serviceById("clinic-adult-l2");
    const doug = instructorProfile("doug-hamilton");
    const keys = ALL_OFFERINGS.map((o) => o.key);
    return [
        // URL model
        check("bookHref matches the spec link", bookHref({ coach: "mike-kenny", service: "private-45", course: "falls-road" }) === "/instruction/book?coach=mike-kenny&service=private-45&course=falls-road", bookHref({ coach: "mike-kenny", service: "private-45", course: "falls-road" })),
        check("clinicsHref = org Clinics redirect target", clinicsHref() === GROUP_PROGRAMS_PATH, clinicsHref()),
        check("instructors view", instructionHref({ view: "instructors" }) === "/instruction?view=instructors" && q("?view=instructors").view === "instructors"),
        check("formats + course example", instructionHref({ formats: ["clinic"], courses: ["needwood"] }) === "/instruction?formats=clinic&course=needwood"),
        check("proHref / serviceHref", proHref("mike-kenny") === "/instruction/pro/mike-kenny" && serviceHref("private-45", "all") === "/instruction/service/private-45"),
        check("Fox P3 link: courses= and numeric days", eq(q("courses=northwest,needwood&days=1,3").courses, ["northwest", "needwood"]) && eq(q("days=1,3").days, [1, 3])),
        check("aliases: group, weekends, day names", q("formats=group").formats.length === 4 && eq(q("days=weekends").days, [0, 6]) && eq(q("days=monday,thu").days, [1, 4])),
        check("course=all means every course", q("course=all").courses.length === 0),
        check("invalid values are dropped", eq(q("formats=nope&from=tomorrow&players=9&time=25:00"), q("")), serializeInstructionQuery(q("formats=nope&from=tomorrow&players=9&time=25:00"))),
        check("booking state parses", eq(q("date=2026-10-14&time=4:30pm&players=2&step=checkout"), { ...q(""), date: "2026-10-14", time: "16:30", players: 2, step: "checkout" })),
        check("unknown params survive", serializeInstructionQuery(q("utm_source=mcg&view=instructors")) === "view=instructors&utm_source=mcg"),
        check("expanded flag", q("expanded=1").expanded && !q("expanded=0").expanded && !q("").expanded),
        ...paths.map((p) => {
            const r = roundTrip(p);
            return check(`round-trips: ${p}`, r.ok, r.canonical);
        }),
        // Org redirects
        check("MCG /clinics → group programs", resolveOrgRedirect(MCG_ORG, "/clinics") === GROUP_PROGRAMS_PATH),
        check("MCG /clinics/:id → service", resolveOrgRedirect(MCG_ORG, "/clinics/ggr-northwest") === "/instruction/service/ggr-northwest"),
        check("no org → no redirect", resolveOrgRedirect(null, "/clinics") === null),
        // Data
        check("re-based by whole weeks (16)", REBASE_DAYS === 112, REBASE_DAYS),
        check("Adult Level 2 still meets on Thursdays", !!adultL2?.startIso && dateOfIso(adultL2.startIso).getDay() === 4, adultL2?.schedule),
        check("every program is upcoming", [...GROUP_SERVICES.map((s) => s.startIso!), ...MCG_CLINICS.map((c) => c.isoDate)].every((iso) => iso >= TODAY_ISO)),
        check("offering keys are unique", new Set(keys).size === keys.length, keys.length),
        check("offeringById resolves Fox ids", !!offeringById("private-45") && !!offeringById("clinic-adult-l2") && !!offeringById("ggr-northwest")),
        check("Needwood clinics filter", needwoodClinics.length > 0 && needwoodClinics.every((o) => o.format === "clinic" && o.courseSlugs.includes("needwood")), needwoodClinics.map((o) => o.id)),
        check("no privates where no instructor teaches (Hampshire Greens)", offeringsAt("hampshire-greens").every((o) => o.format !== "private")),
        check("instructors have headshots (or the placeholder)", COACHES.every((c) => !!c.photo), COACHES.filter((c) => !c.photo).map((c) => c.id)),
        check("instructor contact is the Academy's, never personal", COACHES.every((c) => c.contact.email === "academy@mcggolf.com" && /555-/.test(c.contact.phone))),
        check("Doug Hamilton profile: 2 packs + monthly plan + 3 courses", !!doug && doug.packs.length === 2 && !!doug.plan && doug.courses.length === 3),
    ];
};
