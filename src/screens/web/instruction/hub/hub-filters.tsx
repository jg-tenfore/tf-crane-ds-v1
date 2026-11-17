import type { ReactNode } from "react";
import { XClose } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import type { Course } from "@/data/crane";
import { cx } from "@/utils/cx";
import {
    addDays,
    courseShortName,
    DAY_OPTIONS,
    EMPTY_QUERY,
    fmtMonthDay,
    FORMAT_LABEL,
    FORMAT_ORDER,
    GROUP_FORMATS,
    INSTRUCTION_TODAY,
    isoOf,
    SKILL_LABEL,
    SKILL_ORDER,
    TODAY_ISO,
    type InstructionQuery,
} from "../data";
import { CourseToggle, FilterToggle, focusRing } from "./hub-ui";

type Patch = Partial<InstructionQuery>;

const toggle = <T,>(list: T[], value: T, on: boolean): T[] => (on ? [...list.filter((v) => v !== value), value] : list.filter((v) => v !== value));

/** Exactly the four group formats — what MCG's "Clinics" link lands on. */
export const isGroupOnly = (q: InstructionQuery) => q.formats.length === GROUP_FORMATS.length && GROUP_FORMATS.every((f) => q.formats.includes(f));

/** The query with every hub filter cleared (view and unknown params kept). */
export const clearedFilters = (q: InstructionQuery): Patch => ({ ...EMPTY_QUERY, view: q.view, extra: q.extra, expanded: q.expanded });

/* ------------------------------------------------------------------ */
/* Date presets                                                        */
/* ------------------------------------------------------------------ */

/**
 * The last day of the season `d` falls in: winter ends Feb, spring May, summer Aug, fall Nov 30
 * (MCG programs run by season). Today is Oct 9, so "This season" is today through Nov 30.
 */
export const seasonEnd = (d: Date) => {
    const endMonth = [1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10, 1][d.getMonth()]; // 0-based month the season ends in
    const year = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
    return new Date(year, endMonth + 1, 0);
};

export const DATE_PRESETS = [
    { id: "2w", label: "Next 2 weeks", to: isoOf(addDays(INSTRUCTION_TODAY, 14)) },
    { id: "1m", label: "Next month", to: isoOf(addDays(INSTRUCTION_TODAY, 30)) },
    { id: "season", label: "This season", to: isoOf(seasonEnd(INSTRUCTION_TODAY)) },
].map((p) => ({ ...p, from: TODAY_ISO }));

/* ------------------------------------------------------------------ */
/* Human summary of a query                                            */
/* ------------------------------------------------------------------ */

const dayName = (d: number) => DAY_OPTIONS[d]?.label ?? "";
const PLURAL_DAY = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

export const daysLabel = (days: number[]) => {
    const s = [...days].sort((a, b) => a - b).join(",");
    if (s === "0,6") return "Weekends";
    if (s === "1,2,3,4,5") return "Weekdays";
    if (days.length === 1) return PLURAL_DAY[days[0]];
    return [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(dayName).join(", ");
};

export const datesLabel = (from?: string, to?: string) => {
    const preset = DATE_PRESETS.find((p) => p.from === from && p.to === to);
    if (preset) return preset.label;
    if (from && to) return `${fmtMonthDay(from)} – ${fmtMonthDay(to)}`;
    if (from) return `From ${fmtMonthDay(from)}`;
    return `Until ${fmtMonthDay(to!)}`;
};

export const formatsLabel = (q: InstructionQuery) => (isGroupOnly(q) ? "Clinics & programs" : q.formats.map((f) => FORMAT_LABEL[f]).join(", "));

export const coursesSummary = (courses: string[]) => (courses.length <= 2 ? courses.map(courseShortName).join(" & ") : `${courses.length} courses`);

/** "Group clinics · Needwood · Saturdays" — the deep-link summary line. */
export const querySummary = (q: InstructionQuery): string[] =>
    [
        q.formats.length ? formatsLabel(q) : null,
        q.courses.length ? coursesSummary(q.courses) : null,
        q.days.length ? daysLabel(q.days) : null,
        q.from || q.to ? datesLabel(q.from, q.to) : null,
        q.skills.length ? q.skills.map((s) => SKILL_LABEL[s]).join(", ") : null,
        q.q ? `“${q.q}”` : null,
    ].filter((s): s is string => !!s);

/* ------------------------------------------------------------------ */
/* Removable chips (collapsed)                                         */
/* ------------------------------------------------------------------ */

interface ActiveChip {
    key: string;
    label: string;
    remove: Patch;
}

export const activeChips = (q: InstructionQuery): ActiveChip[] => {
    const chips: ActiveChip[] = [];
    if (isGroupOnly(q)) chips.push({ key: "f-group", label: "Clinics & programs", remove: { formats: [] } });
    else for (const f of q.formats) chips.push({ key: `f-${f}`, label: FORMAT_LABEL[f], remove: { formats: q.formats.filter((x) => x !== f) } });
    for (const c of q.courses) chips.push({ key: `c-${c}`, label: courseShortName(c), remove: { courses: q.courses.filter((x) => x !== c) } });
    const dl = q.days.length ? daysLabel(q.days) : "";
    if (dl === "Weekends" || dl === "Weekdays") chips.push({ key: "d-group", label: dl, remove: { days: [] } });
    else for (const d of q.days) chips.push({ key: `d-${d}`, label: PLURAL_DAY[d], remove: { days: q.days.filter((x) => x !== d) } });
    if (q.from || q.to) chips.push({ key: "dates", label: datesLabel(q.from, q.to), remove: { from: undefined, to: undefined } });
    for (const s of q.skills) chips.push({ key: `s-${s}`, label: SKILL_LABEL[s], remove: { skills: q.skills.filter((x) => x !== s) } });
    if (q.q) chips.push({ key: "q", label: `“${q.q}”`, remove: { q: undefined } });
    return chips;
};

export const ActiveFilterChips = ({ query, onPatch, onClear, className }: { query: InstructionQuery; onPatch: (p: Patch) => void; onClear: () => void; className?: string }) => {
    const chips = activeChips(query);
    if (!chips.length) return null;
    return (
        <div className={cx("flex flex-wrap items-center gap-2", className)} aria-label="Active filters" role="group">
            {chips.map((c) => (
                <AriaButton
                    key={c.key}
                    onPress={() => onPatch(c.remove)}
                    aria-label={`Remove filter: ${c.label}`}
                    className={cx(
                        "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-brand-primary_alt pr-2 pl-3 text-sm font-semibold text-brand-secondary ring-1 ring-brand ring-inset transition duration-100 ease-linear hover:bg-brand-secondary",
                        focusRing,
                    )}
                >
                    {c.label}
                    <XClose className="size-4" aria-hidden="true" />
                </AriaButton>
            ))}
            <AriaButton onPress={onClear} className={cx("h-8 cursor-pointer rounded-md px-2 text-sm font-semibold text-tertiary underline-offset-2 transition duration-100 ease-linear hover:text-secondary hover:underline", focusRing)}>
                Clear all
            </AriaButton>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* The filter fields (panel on tablet+, sheet on mobile web)           */
/* ------------------------------------------------------------------ */

const FilterRow = ({ label, hint, onClear, children }: { label: string; hint?: ReactNode; onClear?: () => void; children: ReactNode }) => (
    <fieldset className="flex flex-col gap-2.5 border-t border-secondary py-4 first:border-t-0 first:pt-0 @desktop:flex-row @desktop:gap-6">
        <div className="flex shrink-0 items-center justify-between gap-2 @desktop:w-40 @desktop:flex-col @desktop:items-start @desktop:justify-start @desktop:pt-2">
            <legend className="float-left text-sm font-semibold text-primary">{label}</legend>
            {onClear && (
                <button type="button" onClick={onClear} className={cx("cursor-pointer rounded-sm text-xs font-semibold text-tertiary underline transition duration-100 ease-linear hover:text-secondary", focusRing)}>
                    Clear
                </button>
            )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
            {children}
            {hint && <p className="text-xs text-tertiary">{hint}</p>}
        </div>
    </fieldset>
);

const DateInput = ({ label, value, min, onChange }: { label: string; value?: string; min?: string; onChange: (v: string | undefined) => void }) => (
    <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-tertiary">{label}</span>
        <input
            type="date"
            value={value ?? ""}
            min={min}
            onChange={(e) => onChange(e.target.value || undefined)}
            className="h-9 w-40 rounded-lg bg-primary px-3 text-sm text-primary ring-1 ring-primary ring-inset outline-none [color-scheme:light] focus:ring-2 focus:ring-brand in-[.dark-mode]:[color-scheme:dark]"
        />
    </label>
);

export const FilterFields = ({ query, courses, onPatch }: { query: InstructionQuery; courses: Course[]; onPatch: (p: Patch) => void }) => (
    <div className="flex flex-col">
        <FilterRow label="Courses" hint={query.courses.length === 0 ? "All nine courses — pick as many as you like" : `${query.courses.length} picked`} onClear={query.courses.length ? () => onPatch({ courses: [] }) : undefined}>
            <div className="flex flex-wrap gap-2">
                {courses.map((c) => (
                    <CourseToggle key={c.id} course={c} isSelected={query.courses.includes(c.id)} onChange={(on) => onPatch({ courses: courses.map((x) => x.id).filter((id) => (id === c.id ? on : query.courses.includes(id))) })} />
                ))}
            </div>
        </FilterRow>

        <FilterRow label="Format" onClear={query.formats.length ? () => onPatch({ formats: [] }) : undefined}>
            <div className="flex flex-wrap gap-2">
                {FORMAT_ORDER.map((f) => (
                    <FilterToggle key={f} isSelected={query.formats.includes(f)} onChange={(on) => onPatch({ formats: toggle(query.formats, f, on) })}>
                        {FORMAT_LABEL[f]}
                    </FilterToggle>
                ))}
            </div>
        </FilterRow>

        <FilterRow
            label="Dates"
            hint="Programs that finish before your dates drop out. Private lessons show only if an instructor has an opening then."
            onClear={query.from || query.to ? () => onPatch({ from: undefined, to: undefined }) : undefined}
        >
            <div className="flex flex-wrap items-end gap-3">
                <DateInput label="From" value={query.from} min={TODAY_ISO} onChange={(from) => onPatch({ from })} />
                <DateInput label="To" value={query.to} min={query.from ?? TODAY_ISO} onChange={(to) => onPatch({ to })} />
                <div className="flex flex-wrap gap-2">
                    {DATE_PRESETS.map((p) => (
                        <FilterToggle
                            key={p.id}
                            isSelected={query.from === p.from && query.to === p.to}
                            onChange={(on) => onPatch(on ? { from: p.from, to: p.to } : { from: undefined, to: undefined })}
                        >
                            {p.label}
                        </FilterToggle>
                    ))}
                </div>
            </div>
        </FilterRow>

        <FilterRow label="Days of the week" onClear={query.days.length ? () => onPatch({ days: [] }) : undefined}>
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <FilterToggle key={d} isSelected={query.days.includes(d)} onChange={(on) => onPatch({ days: toggle(query.days, d, on).sort((a, b) => a - b) })}>
                        {dayName(d)}
                    </FilterToggle>
                ))}
            </div>
        </FilterRow>

        <FilterRow label="Skill set" onClear={query.skills.length ? () => onPatch({ skills: [] }) : undefined}>
            <div className="flex flex-wrap gap-2">
                {SKILL_ORDER.map((s) => (
                    <FilterToggle key={s} isSelected={query.skills.includes(s)} onChange={(on) => onPatch({ skills: SKILL_ORDER.filter((x) => (x === s ? on : query.skills.includes(x))) })}>
                        {SKILL_LABEL[s]}
                    </FilterToggle>
                ))}
            </div>
        </FilterRow>
    </div>
);
