/**
 * Instruction URL model — every hub filter and booking selection lives in the query string, so
 * any state is a deep link (Nov 17 call: link from an instructor's MCG page straight to their
 * booking; a webmaster-built "Monday clinics at Needwood" link; a promotion).
 *
 * Params (all optional; unknown params are kept in `extra` and written back unchanged):
 *
 * | param      | meaning                                  | examples                                   |
 * | ---------- | ---------------------------------------- | ------------------------------------------ |
 * | `view`     | hub tab                                  | `services` (default) · `instructors`       |
 * | `course`   | one or many course ids, or `all`         | `needwood` · `falls-road,needwood` · `all` |
 * | `formats`  | offering formats (`group` = all group)   | `private` · `clinic,op36` · `group`        |
 * | `from`/`to`| date range, ISO                          | `2026-10-12`                               |
 * | `days`     | weekdays (names or 0–6, or `weekdays`/`weekends`) | `mon,thu` · `1,4` · `weekends`    |
 * | `skills`   | skill sets                               | `beginner,short-game`                      |
 * | `coach`    | instructor id (or `any`)                 | `mike-kenny`                               |
 * | `service`  | service / program id                     | `private-45` · `clinic-adult-l2`           |
 * | `q`        | free-text search                         | `wedge`                                    |
 * | `expanded` | filter panel open (`1`); default collapsed | `1`                                      |
 * | `date`     | booking: chosen day (ISO)                | `2026-10-14`                               |
 * | `time`     | booking: chosen slot, 24h `HH:MM`        | `16:30`                                    |
 * | `players`  | booking: party size 1–4                  | `2`                                        |
 * | `step`     | booking/flow step (screen-defined)       | `checkout` · `waitlist`                    |
 * | `pack`     | lesson package id                        | `mike-kenny--pack-5`                       |
 *
 * Fox Prototype 3 links still parse: it used `courses=` (plural) and numeric `days=`.
 * Serialization is canonical: view, coach, service, formats, course, skills, days, from, to, q, date,
 * time, players, step, pack, expanded, then unknown params — `course=` singular, day names, commas
 * unescaped. So `bookHref(…)` is `/instruction/book?coach=mike-kenny&service=private-45&course=falls-road`.
 *
 * Pure functions only — the React hook is `useInstructionQuery()` in `../use-instruction-query.ts`.
 */
import { parseTime, timeParam } from "./dates";
import type { OfferingFilter } from "./offerings";
import { DAY_OPTIONS, FORMAT_ORDER, GROUP_FORMATS, SKILL_ORDER, type OfferingFormat, type SkillTag } from "./vocab";

export type HubView = "services" | "instructors";

export interface InstructionQuery {
    view: HubView;
    /** Course ids. Empty = every course ("all"). */
    courses: string[];
    formats: OfferingFormat[];
    skills: SkillTag[];
    /** Weekdays, 0 = Sunday. Empty = any day. */
    days: number[];
    from?: string;
    to?: string;
    q?: string;
    coach?: string;
    service?: string;
    /** Filter panel open. The hub lands collapsed (clean tiles + a "Filters" button) unless set. */
    expanded: boolean;
    /** Booking: chosen day, ISO. */
    date?: string;
    /** Booking: chosen slot, "HH:MM" (24h). */
    time?: string;
    /** Booking: party size. */
    players?: number;
    /** Screen-defined step ("time", "waitlist", "checkout", "confirmation", …). */
    step?: string;
    /** Lesson package id. */
    pack?: string;
    /** Params this model doesn't know, preserved verbatim. */
    extra: Record<string, string>;
}

export const EMPTY_QUERY: InstructionQuery = { view: "services", courses: [], formats: [], skills: [], days: [], expanded: false, extra: {} };

const KNOWN = new Set(["view", "course", "courses", "formats", "format", "skills", "skill", "days", "day", "from", "to", "q", "coach", "service", "expanded", "date", "time", "players", "step", "pack"]);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const list = (v: string | null | undefined) =>
    (v ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
const uniq = <T,>(xs: T[]) => [...new Set(xs)];

const parseDays = (values: string[]): number[] => {
    const out: number[] = [];
    for (const v of values) {
        if (v === "weekdays") out.push(1, 2, 3, 4, 5);
        else if (v === "weekends" || v === "weekend") out.push(0, 6);
        else if (/^[0-6]$/.test(v)) out.push(Number(v));
        else {
            const d = DAY_OPTIONS.find((o) => v.startsWith(o.param));
            if (d) out.push(d.value);
        }
    }
    return uniq(out).sort((a, b) => a - b);
};

const parseFormats = (values: string[]): OfferingFormat[] => {
    const out: OfferingFormat[] = [];
    for (const v of values) {
        if (v === "group" || v === "groups" || v === "clinics" || v === "programs") out.push(...GROUP_FORMATS);
        else if (v === "privates" || v === "lessons") out.push("private");
        else if ((FORMAT_ORDER as string[]).includes(v)) out.push(v as OfferingFormat);
    }
    return FORMAT_ORDER.filter((f) => out.includes(f));
};

const toParams = (input: string | URLSearchParams | Record<string, string | undefined>): URLSearchParams => {
    if (input instanceof URLSearchParams) return input;
    if (typeof input === "string") return new URLSearchParams(input.includes("?") ? input.slice(input.indexOf("?") + 1).split("#")[0] : input.replace(/^#/, ""));
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(input)) if (v !== undefined) p.set(k, v);
    return p;
};

/**
 * Parse a query string (`"?view=instructors"`), a full path (`"/instruction?formats=group"`),
 * `URLSearchParams` or a plain object into an `InstructionQuery`. Invalid values are dropped.
 */
export const parseInstructionQuery = (input: string | URLSearchParams | Record<string, string | undefined> = ""): InstructionQuery => {
    const p = toParams(input);
    const courses = list(p.get("course") ?? p.get("courses")).filter((c) => c !== "all" && c !== "any");
    const from = p.get("from") ?? undefined;
    const to = p.get("to") ?? undefined;
    const date = p.get("date") ?? undefined;
    const t = p.get("time");
    const time = t ? parseTime(t) : null;
    const players = Number(p.get("players"));
    const expandedRaw = p.get("expanded");
    const extra: Record<string, string> = {};
    p.forEach((v, k) => {
        if (!KNOWN.has(k)) extra[k] = v;
    });
    const str = (k: string) => p.get(k)?.trim() || undefined;
    return {
        view: p.get("view") === "instructors" ? "instructors" : "services",
        courses: uniq(courses),
        formats: parseFormats(list(p.get("formats") ?? p.get("format"))),
        skills: SKILL_ORDER.filter((s) => list(p.get("skills") ?? p.get("skill")).includes(s)),
        days: parseDays(list(p.get("days") ?? p.get("day"))),
        from: from && ISO.test(from) ? from : undefined,
        to: to && ISO.test(to) ? to : undefined,
        q: str("q"),
        coach: str("coach"),
        service: str("service"),
        expanded: expandedRaw !== null && !["0", "false", "no"].includes(expandedRaw.toLowerCase()),
        date: date && ISO.test(date) ? date : undefined,
        time: time !== null ? timeParam(time) : undefined,
        players: Number.isInteger(players) && players >= 1 && players <= 4 ? players : undefined,
        step: str("step"),
        pack: str("pack"),
        extra,
    };
};

const enc = (v: string) => encodeURIComponent(v).replace(/%2C/gi, ",").replace(/%3A/gi, ":");

/** Canonical query string for a (partial) query — no leading "?"; "" when nothing is set. */
export const serializeInstructionQuery = (query: Partial<InstructionQuery>): string => {
    const q = { ...EMPTY_QUERY, ...query };
    const pairs: [string, string][] = [];
    if (q.view === "instructors") pairs.push(["view", "instructors"]);
    if (q.coach) pairs.push(["coach", q.coach]);
    if (q.service) pairs.push(["service", q.service]);
    if (q.formats.length) pairs.push(["formats", FORMAT_ORDER.filter((f) => q.formats.includes(f)).join(",")]);
    if (q.courses.length) pairs.push(["course", q.courses.join(",")]);
    if (q.skills.length) pairs.push(["skills", SKILL_ORDER.filter((s) => q.skills.includes(s)).join(",")]);
    if (q.days.length)
        pairs.push([
            "days",
            [...q.days]
                .sort((a, b) => a - b)
                .map((d) => DAY_OPTIONS[d]?.param)
                .filter(Boolean)
                .join(","),
        ]);
    if (q.from) pairs.push(["from", q.from]);
    if (q.to) pairs.push(["to", q.to]);
    if (q.q) pairs.push(["q", q.q]);
    if (q.date) pairs.push(["date", q.date]);
    if (q.time) pairs.push(["time", q.time]);
    if (q.players) pairs.push(["players", String(q.players)]);
    if (q.step) pairs.push(["step", q.step]);
    if (q.pack) pairs.push(["pack", q.pack]);
    if (q.expanded) pairs.push(["expanded", "1"]);
    for (const [k, v] of Object.entries(q.extra)) if (!KNOWN.has(k)) pairs.push([k, v]);
    return pairs.map(([k, v]) => `${enc(k)}=${enc(v)}`).join("&");
};

/** `path` + the query (`"/instruction?formats=clinic"`), or the bare path when the query is empty. */
export const withQuery = (path: string, query: Partial<InstructionQuery>) => {
    const qs = serializeInstructionQuery(query);
    return qs ? `${path}?${qs}` : path;
};

/** Split a router path into its pathname and parsed query. */
export const splitPath = (path: string): { pathname: string; query: InstructionQuery } => {
    const [pathname, rest = ""] = path.split("#")[0].split("?");
    return { pathname: pathname || "/", query: parseInstructionQuery(rest) };
};

/** True when anything that narrows the hub's results is set (courses, formats, skills, days, dates, text). */
export const isFiltered = (q: InstructionQuery) => q.courses.length > 0 || q.formats.length > 0 || q.skills.length > 0 || q.days.length > 0 || !!q.from || !!q.to || !!q.q;

/** How many filter groups are active — the badge on a collapsed "Filters" button. */
export const activeFilterCount = (q: InstructionQuery) => [q.courses.length, q.formats.length, q.skills.length, q.days.length, q.from || q.to ? 1 : 0].filter((n) => n > 0).length;

/** The hub query as an `OfferingFilter` for `filterOfferings()`. */
export const queryToFilter = (q: InstructionQuery): OfferingFilter => ({
    courses: q.courses,
    formats: q.formats,
    skills: q.skills,
    days: q.days,
    from: q.from,
    to: q.to,
    q: q.q,
    type: "all",
});

/* ------------------------------------------------------------------ */
/* Hrefs — the canonical link for every Instruction state              */
/* ------------------------------------------------------------------ */

/** The hub: `/instruction` + filters. `instructionHref({ view: "instructors" })`, `instructionHref({ formats: ["clinic"], courses: ["needwood"] })`. */
export const instructionHref = (query: Partial<InstructionQuery> = {}) => withQuery("/instruction", query);

/** Group programs only — where "Clinics" goes under MCG. */
export const clinicsHref = (query: Partial<InstructionQuery> = {}) => instructionHref({ ...query, formats: GROUP_FORMATS });

/** The instructor-first hub tab. */
export const instructorsHref = (query: Partial<InstructionQuery> = {}) => instructionHref({ ...query, view: "instructors" });

/** A service, program or county clinic: `/instruction/service/private-45?course=falls-road`. (`course` "all" is dropped.) */
export const serviceHref = (id: string, course?: string, query: Partial<InstructionQuery> = {}) =>
    withQuery(`/instruction/service/${encodeURIComponent(id)}`, { ...query, courses: course && course !== "all" ? [course] : (query.courses ?? []) });

/** The instructor profile ("pro" layout): `/instruction/pro/mike-kenny`. */
export const proHref = (id: string, query: Partial<InstructionQuery> = {}) => withQuery(`/instruction/pro/${encodeURIComponent(id)}`, query);

/** The Academy-style instructor page (renders the same profile): `/instruction/instructors/mike-kenny`. */
export const instructorHref = (id: string, query: Partial<InstructionQuery> = {}) => withQuery(`/instruction/instructors/${encodeURIComponent(id)}`, query);

export interface BookSelection {
    coach: string;
    service: string;
    course?: string;
    from?: string;
    to?: string;
    date?: string;
    time?: string;
    players?: number;
    step?: string;
}

/** Booking: `/instruction/book?coach=mike-kenny&service=private-45&course=falls-road` (+ date/time/players/step). */
export const bookHref = ({ coach, service, course, ...rest }: BookSelection) => withQuery("/instruction/book", { coach, service, courses: course && course !== "all" ? [course] : [], ...rest });

/** Leave a review for a completed lesson: `/instruction/review?coach=…&service=…&course=…&date=…`. */
export const reviewHref = ({ coachId, serviceId, courseSlug, date }: { coachId: string; serviceId: string; courseSlug?: string; date?: string }) =>
    withQuery("/instruction/review", { coach: coachId, service: serviceId, courses: courseSlug ? [courseSlug] : [], date });

/** Lesson packages (optionally one instructor's): `/instruction/packages?coach=mike-kenny`. */
export const packagesHref = (query: Partial<InstructionQuery> = {}) => withQuery("/instruction/packages", query);

/** The golfer's lesson credits: `/instruction/credits`. */
export const creditsHref = (query: Partial<InstructionQuery> = {}) => withQuery("/instruction/credits", query);
