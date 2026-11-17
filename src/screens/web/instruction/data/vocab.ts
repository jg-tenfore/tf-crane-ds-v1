/**
 * The Instruction vocabulary — formats, skill sets, instruction types, days — shared by the
 * offering catalog (`offerings.ts`) and the URL model (`query.ts`). Ported from Fox Prototype 3
 * (`mcg-3/instruction/offerings.ts`); ids are identical so Fox deep links carry over.
 */

/**
 * The instruction type — Fox's "clinic type". Golf is the only one MCG runs, but it is a real
 * field, so a pickleball lesson would be one more entry rather than a second system.
 */
export type InstructionType = "golf";

export const INSTRUCTION_TYPE_LABEL: Record<InstructionType, string> = {
    golf: "Golf lessons",
};

/** What kind of thing it is — the way golfers and MCG staff talk about them. */
export type OfferingFormat = "private" | "clinic" | "junior-camp" | "junior-league" | "op36";

export const FORMAT_LABEL: Record<OfferingFormat, string> = {
    private: "Private lessons",
    clinic: "Group clinics",
    "junior-camp": "Junior camps",
    "junior-league": "Junior league",
    op36: "Op 36",
};

export const FORMAT_ORDER: OfferingFormat[] = ["private", "clinic", "junior-camp", "junior-league", "op36"];

/** Every group format (everything but private) — what "Clinics" means under MCG. */
export const GROUP_FORMATS: OfferingFormat[] = ["clinic", "junior-camp", "junior-league", "op36"];

/** Group formats run to a schedule; a private is booked against an instructor's day. */
export const isGroupFormat = (format: OfferingFormat) => format !== "private";

export type SkillTag = "beginner" | "kids" | "advanced" | "short-game" | "putting" | "on-course";

export const SKILL_LABEL: Record<SkillTag, string> = {
    beginner: "Beginner-friendly",
    kids: "Kid-friendly",
    advanced: "Advanced",
    "short-game": "Short game & chipping",
    putting: "Putting",
    "on-course": "On-course",
};

export const SKILL_ORDER: SkillTag[] = ["beginner", "kids", "advanced", "short-game", "putting", "on-course"];

/** Weekday chips, 0 = Sunday. `param` is the URL form (`?days=mon,thu`). */
export const DAY_OPTIONS: { value: number; label: string; param: string }[] = [
    { value: 0, label: "Sun", param: "sun" },
    { value: 1, label: "Mon", param: "mon" },
    { value: 2, label: "Tue", param: "tue" },
    { value: 3, label: "Wed", param: "wed" },
    { value: 4, label: "Thu", param: "thu" },
    { value: 5, label: "Fri", param: "fri" },
    { value: 6, label: "Sat", param: "sat" },
];
