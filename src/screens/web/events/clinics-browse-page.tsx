import { useState } from "react";
import { Calendar, GraduationHat01, MarkerPin01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { PageHeader, SectionHeading, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { useWebSession, WebShell } from "../web-shell";
import { availability, CLINIC_FOCUSES, clinicNextSession, CLINICS, fmtDay, INSTRUCTORS, isPast, SKILL_LEVELS, type Clinic, type ClinicFocus, type SkillLevel } from "./events-data";
import { AvailabilityBadge, ChipRow, FilterChip, FilterMenuChip, focusRing, InitialsAvatar, LabelPill, money, SpotsMeter, WebButton } from "./events-ui";

export const LEVEL_TONE: Record<SkillLevel, string> = {
    Beginner: "bg-utility-green-50 text-utility-green-700 ring-utility-green-200",
    Intermediate: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
    Advanced: "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
    "All levels": "bg-utility-neutral-50 text-utility-neutral-700 ring-utility-neutral-200",
};

export const LevelBadge = ({ level }: { level: SkillLevel }) => (
    <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset", LEVEL_TONE[level])}>{level}</span>
);

export const sessionsSummary = (c: Clinic) => {
    if (c.sessions.length === 1) return `${fmtDay(c.sessions[0].date)} · ${c.sessions[0].time}`;
    const weekday = new Date(c.sessions[0].date + "T12:00").toLocaleDateString("en-US", { weekday: "long" });
    return `${c.sessions.length} ${weekday}s from ${fmtDay(c.sessions[0].date)} · ${c.sessions[0].time}`;
};

/** One clinic as a horizontal row on desktop, a stacked card on mobile web. */
export const ClinicRow = ({ clinic }: { clinic: Clinic }) => {
    const status = availability(clinic);
    return (
        <WebLink
            href={`/clinics/${clinic.id}`}
            className={cx(
                "group flex flex-col overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:ring-primary @tablet:flex-row",
                focusRing,
            )}
        >
            <div className="relative aspect-[16/9] w-full shrink-0 bg-tertiary @tablet:aspect-auto @tablet:w-56">
                <img src={clinic.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 @desktop:flex-row @desktop:items-center @desktop:gap-8">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <LevelBadge level={clinic.level} />
                        <LabelPill>{clinic.focus}</LabelPill>
                        {clinic.ageGroup && <LabelPill>{clinic.ageGroup}</LabelPill>}
                        {status !== "open" && <AvailabilityBadge availability={status} waitlist={!!clinic.waitlist} />}
                    </div>
                    <p className="mt-2 text-lg font-semibold text-primary transition duration-100 ease-linear group-hover:text-brand-secondary">{clinic.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-tertiary">
                        <Calendar className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                        {sessionsSummary(clinic)}
                    </p>
                    <div className="mt-3 flex items-center gap-2.5">
                        <InitialsAvatar initials={clinic.instructor.initials} size="sm" />
                        <span className="text-sm text-secondary">
                            with <span className="font-semibold text-primary">{clinic.instructor.name}</span>
                        </span>
                        <span className="hidden items-center gap-1 text-sm text-tertiary @tablet:flex">
                            · <MarkerPin01 className="size-4 text-fg-quaternary" aria-hidden="true" /> {clinic.location}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3 border-t border-secondary pt-3 @desktop:w-56 @desktop:border-t-0 @desktop:border-l @desktop:pt-0 @desktop:pl-8">
                    <p className="text-lg font-semibold text-primary tabular-nums">
                        {money(clinic.price)} <span className="text-sm font-normal text-tertiary">{clinic.priceUnit}</span>
                    </p>
                    <SpotsMeter capacity={clinic.capacity} spotsLeft={clinic.spotsLeft} />
                </div>
            </div>
        </WebLink>
    );
};

export interface ClinicsBrowsePageProps {
    initialLevel?: SkillLevel | "all";
}

/**
 * /clinics — ports Fox "Global Nav/Clinics" (clinics.stories.tsx). Fox's agenda rows become
 * clinic cards with the instructor, skill level, sessions and a spots meter; Fox's month view
 * lives on /calendar (filter: Clinics). Filters: level, focus, available.
 */
export const ClinicsBrowsePage = ({ initialLevel = "all" }: ClinicsBrowsePageProps) => {
    const { course } = useWebSession();
    const [level, setLevel] = useState<SkillLevel | "all">(initialLevel);
    const [focus, setFocus] = useState<ClinicFocus | "all">("all");
    const [available, setAvailable] = useState(false);

    let list = CLINICS.filter((c) => !isPast(c.sessions[c.sessions.length - 1].date));
    if (level !== "all") list = list.filter((c) => c.level === level);
    if (focus !== "all") list = list.filter((c) => c.focus === focus);
    if (available) list = list.filter((c) => c.spotsLeft > 0);
    list = [...list].sort((a, b) => clinicNextSession(a).date.localeCompare(clinicNextSession(b).date));

    return (
        <WebShell active="clinics">
            <WebPage>
                <PageHeader eyebrow={course.name} title="Clinics" subtitle="Small-group instruction with our PGA professionals, from first swings to scoring." />

                <ChipRow className="mt-7">
                    <FilterMenuChip
                        menuLabel="Skill level"
                        icon={GraduationHat01}
                        label={level === "all" ? "Any level" : level}
                        isActive={level !== "all"}
                        options={[{ id: "all", label: "Any level" }, ...SKILL_LEVELS.map((l) => ({ id: l, label: l }))]}
                        value={level}
                        onChange={(v) => setLevel(v as SkillLevel | "all")}
                    />
                    <FilterMenuChip
                        menuLabel="Focus"
                        label={focus === "all" ? "Focus" : focus}
                        isActive={focus !== "all"}
                        options={[{ id: "all", label: "Any focus" }, ...CLINIC_FOCUSES.map((f) => ({ id: f, label: f }))]}
                        value={focus}
                        onChange={(v) => setFocus(v as ClinicFocus | "all")}
                    />
                    <FilterChip isSelected={available} onChange={setAvailable}>
                        Available
                    </FilterChip>
                </ChipRow>
                <p className="mt-4 text-sm text-tertiary" aria-live="polite">
                    {list.length} {list.length === 1 ? "clinic" : "clinics"}
                </p>

                <div className="mt-5 flex flex-col gap-4">
                    {list.map((c) => (
                        <ClinicRow key={c.id} clinic={c} />
                    ))}
                    {list.length === 0 && (
                        <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-14 text-center ring-1 ring-secondary ring-inset">
                            <p className="text-md font-semibold text-primary">No clinics match</p>
                            <WebButton
                                size="sm"
                                color="outline"
                                className="mt-2"
                                onPress={() => {
                                    setLevel("all");
                                    setFocus("all");
                                    setAvailable(false);
                                }}
                            >
                                Clear filters
                            </WebButton>
                        </div>
                    )}
                </div>

                <section className="mt-14">
                    <SectionHeading title="Our instructors" />
                    <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-3">
                        {Object.values(INSTRUCTORS).map((i) => (
                            <div key={i.name} className="flex gap-4 rounded-2xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                                <InitialsAvatar initials={i.initials} size="lg" />
                                <div className="min-w-0">
                                    <p className="text-md font-semibold text-primary">{i.name}</p>
                                    <p className="text-sm font-medium text-brand-secondary">{i.title}</p>
                                    <p className="mt-1.5 text-sm text-tertiary">{i.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </WebPage>
        </WebShell>
    );
};
