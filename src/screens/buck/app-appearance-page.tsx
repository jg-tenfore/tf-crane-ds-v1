/**
 * Buck › Settings › Crane app › App appearance: where a course customizes its white-label Crane app.
 *
 * R&D exploration from the Nov 24, 2026 call. People find the Crane app plain next to white-label club
 * apps built on other platforms (mostly one great hero photo plus a feed). The answer explored here is
 * not a redesign and not a free-for-all ("90% of courses will make it look bad"): four curated dials,
 *   1. a palette (one of 12 tuned palettes, never a hex code),
 *   2. a hero photo (one photo with guardrails, or a TenFore default photo),
 *   3. the logo and name,
 *   4. an announcements feed,
 * plus Weston's idea of a TenFore design review before changes go live. The course sets this in Buck;
 * golfers never choose.
 *
 * Everything is local state: a mock. The phone preview is the themed club home (`ClubHomePreview`,
 * src/screens/club) by default, behind a `renderPreview` slot. The hero rules (header size, focus point
 * as `object-position`, the quality check, the fallback photos) come from src/screens/club/hero-guardrails.ts,
 * so the crop drawn here is the crop the phone shows.
 *
 * Desktop only (about 1440 wide), in Buck's look: Buck is the Untitled UI sibling of this system, so the
 * page uses this repo's components and semantic tokens. Shared components get their desktop sizes from
 * the `.crane-web` sizing hook (their `in-[.crane-web]:` variants); the font is switched back to Buck's
 * Inter. The phone preview sits outside that hook so it keeps its iPhone sizes.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FC, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import {
    Button as AriaButton,
    Disclosure as AriaDisclosure,
    DisclosurePanel as AriaDisclosurePanel,
    Label as AriaLabel,
    Menu as AriaMenu,
    MenuItem as AriaMenuItem,
    MenuTrigger as AriaMenuTrigger,
    Popover as AriaPopover,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    Text as AriaText,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
} from "react-aria-components";
import {
    AlertTriangle,
    Announcement02,
    BarChart07,
    BarChartSquare02,
    CalendarCheck01,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    HelpCircle,
    Image01,
    InfoCircle,
    Palette,
    Pin01,
    Plus,
    SearchLg,
    Send01,
    Settings01,
    Tag01,
    Target04,
    Type01,
    UploadCloud02,
    User01,
    Users01,
} from "@untitledui/icons";
import { Tag, StatusBadge, type StatusTone, type TagTone } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { SegmentedControl } from "@/components/base/segmented-control";
import { Switch } from "@/components/base/switch";
import { ClubTheme } from "@/components/club-theme/club-theme";
import { checkMode, PaletteChip, paletteContrastSummary, PaletteSwatch } from "@/components/club-theme/palette-swatch";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { TfLogo } from "@/components/foundations/logos";
import { CLUB_PROFILES, clubProfileFor, type ClubProfile, type FeedPost } from "@/data/club-profiles";
import { CLUB_PALETTES, PALETTE_FAMILIES, paletteById, paletteRamp } from "@/data/club-themes";
import { courseById, TODAY, type Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { coursePhotos } from "@/screens/chrome/course-photos";
import {
    CLUB_PREVIEW_SIZE,
    ClubHomePreview,
    HERO_ASPECT,
    HERO_SIZE,
    heroFallbackPhotos,
    heroQuality,
    LOW_RES_SAMPLE_PHOTO,
    objectPosition,
    useImageSize,
} from "@/screens/club";
import { DEFAULT_PHOTO_SETS, TENFORE_DEFAULT_SET, type DefaultPhotoSetId } from "@/screens/web/instruction/data/default-art";
import { cx } from "@/utils/cx";

/* ------------------------------------------------------------------ */
/* Sample data and rules                                                */
/* ------------------------------------------------------------------ */

/** A photo a course could "upload" (the upload is simulated: it picks one of these). */
export interface SamplePhoto {
    id: string;
    file: string;
    src: string;
    width: number;
    height: number;
}

/** The sample club photos, plus a 480 px copy of the Kettle Hills photo that trips the low-resolution warning. */
export const SAMPLE_UPLOADS: SamplePhoto[] = [
    { id: "falls-road", file: "falls-road-14th-green.jpg", src: coursePhotos.fallsRoad, width: 1000, height: 667 },
    { id: "kettle-hills", file: "kettle-hills-ponds.jpg", src: coursePhotos.kettleHills, width: 1200, height: 924 },
    { id: "memorial-park", file: "memorial-park-18th.jpg", src: coursePhotos.memorialPark, width: 1200, height: 662 },
    { id: "flogolf", file: "flogolf-lounge-bays.jpg", src: coursePhotos.flogolf, width: 1024, height: 683 },
    { id: "laytonsville", file: "laytonsville-clubhouse.jpg", src: coursePhotos.laytonsville, width: 1200, height: 801 },
    { id: "northwest", file: "northwest-first-tee.jpg", src: coursePhotos.northwest, width: 1200, height: 801 },
    { id: "hampshire-greens", file: "hampshire-greens-9th.jpg", src: coursePhotos.hampshireGreens, width: 1200, height: 801 },
    { id: "phone-snapshot", file: "IMG_4127.jpg", src: LOW_RES_SAMPLE_PHOTO, width: 480, height: 370 },
];

/** The id of the low-resolution sample (for stories). */
export const LOW_RES_SAMPLE_ID = "phone-snapshot";

/** TenFore default photos are 1200 wide, 3:2. Each set offers the three that work as a landscape hero. */
const TENFORE_PHOTO = { width: 1200, height: 800 };
const setPhotos = (set: DefaultPhotoSetId) => heroFallbackPhotos(set);

const KIND: Record<FeedPost["kind"], { label: string; tone: TagTone }> = {
    news: { label: "News", tone: "gray" },
    event: { label: "Event", tone: "brand" },
    offer: { label: "Offer", tone: "warning" },
    course: { label: "Course update", tone: "success" },
};

/** Curated destinations for a post's button: a course picks one, it never types a link. */
const POST_BUTTONS = [
    { id: "book", label: "Book a tee time", href: "/home" },
    { id: "events", label: "See the event", href: "/events" },
    { id: "shop", label: "Shop the pro shop", href: "/store" },
    { id: "lessons", label: "Book a lesson", href: "/lessons" },
];

const LIMITS = { name: 30, tagline: 48, iconName: 12, postTitle: 60, postBody: 200 };

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FocusPoint {
    x: number;
    y: number;
}

export interface HeroState {
    /** `upload`: the course's own photo. `tenfore`: a photo from one of TenFore's default sets. */
    source: "upload" | "tenfore";
    /** A SAMPLE_UPLOADS id. Missing with source `upload` → nothing uploaded yet (the fallback shows). */
    uploadId?: string;
    setId: DefaultPhotoSetId;
    /** Which of the set's five photos. */
    setPhoto: number;
    focus: FocusPoint;
}

/** Where the changes are: Live (nothing pending) → Draft → Saved → In review → Approved → Published. */
export type ReviewStatus = "live" | "draft" | "saved" | "in-review" | "approved" | "published";

export type AppearanceSectionId = "palette" | "hero" | "logo" | "announcements";

export interface PostDraft {
    kind: FeedPost["kind"];
    title: string;
    body: string;
    /** A SAMPLE_UPLOADS id, or "none". */
    imageId: string;
    withButton: boolean;
    buttonId: string;
    expiry: "none" | "week" | "month";
}

/** Everything the phone preview needs, with every edit applied. */
export interface AppearancePreviewState {
    /** The club profile with the edited palette, photo, focus, name, tagline and feed. */
    profile: ClubProfile;
    course: Course;
    paletteId: string;
    /** The photo the phone shows: the upload or the picked TenFore photo. `null`: no photo, so the app shows TenFore's default photos. */
    heroPhoto: string | null;
    heroFocus: FocusPoint;
    dark: boolean;
    /** Which screen the preview opens on: the home, or the News & updates feed. */
    screen: "home" | "feed";
}

export interface AppAppearancePageProps {
    /** Course id of the club to load (one of CLUB_PROFILES). Default: Sagamore Spring. */
    clubId?: string;
    /** Start with a different palette than the club's live one (a story mid-edit). */
    initialPaletteId?: string;
    /** Start with the palette's contrast checks expanded. */
    initialChecksOpen?: boolean;
    /** Start with a different hero than the club's live one. */
    initialHero?: Partial<HeroState>;
    /** Start with the "New post" composer open (pass a draft to pre-fill it). */
    initialComposer?: boolean | Partial<PostDraft>;
    /** Start in this review state (default: Live, or Draft when an initial override changes something). */
    initialStatus?: ReviewStatus;
    /** Start with the preview in dark mode. */
    initialDark?: boolean;
    /** Start the preview on the home (default) or the News & updates feed. */
    initialPreviewScreen?: "home" | "feed";
    /**
     * Weston's design-approval step. On (default): Publish stays disabled until TenFore approves.
     * Off: the variant without a review, where Publish is available as soon as there are changes.
     */
    reviewRequired?: boolean;
    /** Scroll this section into view on load. */
    focusSection?: AppearanceSectionId;
    /** Renders the phone (frame included) for the current settings. Default: the themed club home (`ClubHomePreview`). */
    renderPreview?: (state: AppearancePreviewState) => ReactNode;
    /** Scale of the phone in the sticky preview (the bezel frame is 428 × 900). Default 0.73. */
    previewScale?: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const CENTER: FocusPoint = { x: 0.5, y: 0.5 };
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/**
 * The crop the phone uses (fractions of the photo). The club home crops the photo to the header's aspect
 * with object-fit: cover and the focus point as `object-position`, so the crop slides across the spare
 * width (or height) in proportion to the focus point.
 */
export const heroCrop = (imageAspect: number, focus: FocusPoint) => {
    const w = HERO_ASPECT < imageAspect ? HERO_ASPECT / imageAspect : 1;
    const h = HERO_ASPECT < imageAspect ? 1 : imageAspect / HERO_ASPECT;
    return { x: focus.x * (1 - w), y: focus.y * (1 - h), w, h, objectPosition: objectPosition(focus) };
};

/** The photo a hero state resolves to, and whether it's the fallback. */
const resolveHero = (hero: HeroState) => {
    if (hero.source === "upload") {
        const up = SAMPLE_UPLOADS.find((u) => u.id === hero.uploadId);
        if (up) return { src: up.src, width: up.width, height: up.height, label: up.file, isFallback: false, upload: up };
        const src = setPhotos(TENFORE_DEFAULT_SET)[0];
        return { src, ...TENFORE_PHOTO, label: "TenFore default photos", isFallback: true, upload: undefined };
    }
    const photos = setPhotos(hero.setId);
    const set = DEFAULT_PHOTO_SETS.find((s) => s.id === hero.setId);
    return { src: photos[hero.setPhoto % photos.length] ?? photos[0], ...TENFORE_PHOTO, label: `${set?.label ?? "TenFore"} photo`, isFallback: false, upload: undefined };
};

/** A resolved photo with its measured pixel size (the declared size until the image has loaded). */
const usePhotoSize = <T extends { src: string; width: number; height: number }>(photo: T): T => {
    const measured = useImageSize(photo.src);
    return measured ? { ...photo, ...measured } : photo;
};

const heroFromProfile = (profile: ClubProfile): HeroState => {
    const up = profile.heroPhoto ? SAMPLE_UPLOADS.find((u) => u.src === profile.heroPhoto) : undefined;
    return up
        ? { source: "upload", uploadId: up.id, setId: TENFORE_DEFAULT_SET, setPhoto: 0, focus: profile.heroFocus ?? CENTER }
        : { source: "upload", setId: TENFORE_DEFAULT_SET, setPhoto: 0, focus: CENTER };
};

const sameHero = (a: HeroState, b: HeroState) =>
    a.source === b.source &&
    (a.source === "upload" ? a.uploadId === b.uploadId : a.setId === b.setId && a.setPhoto === b.setPhoto) &&
    Math.abs(a.focus.x - b.focus.x) < 0.005 &&
    Math.abs(a.focus.y - b.focus.y) < 0.005;

/** The name under the app icon: as many whole words of the display name as fit in 12 characters. */
const iconNameFor = (name: string) => {
    let out = "";
    for (const w of name.split(/\s+/)) {
        const next = out ? `${out} ${w}` : w;
        if (next.length > LIMITS.iconName) break;
        out = next;
    }
    return out || name.slice(0, LIMITS.iconName);
};

/** The course record a club's logo comes from (MCG's `logoOrg` picks the MCG mark, not Falls Road's). Renaming never changes it. */
const logoCourse = (profile: ClubProfile, course: Course): Course => (profile.logoOrg ? { ...course, id: "", shortName: "", name: profile.logoOrg } : course);

const sortFeed = (feed: FeedPost[]) => [...feed].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.postedOn.getTime() - a.postedOn.getTime());

/* ------------------------------------------------------------------ */
/* Buck chrome                                                          */
/* ------------------------------------------------------------------ */

const BUCK_FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
/** Buck surfaces: desktop sizes from the `.crane-web` hook, in Buck's Inter. */
const buckSurface = { className: "crane-web", style: { fontFamily: BUCK_FONT, "--font-body": BUCK_FONT, "--font-display": BUCK_FONT } as CSSProperties };

interface NavItem {
    label: string;
    icon?: FC<{ className?: string }>;
    active?: boolean;
    children?: NavItem[];
}

const NAV: NavItem[] = [
    { label: "Dashboard", icon: BarChartSquare02 },
    { label: "Tee Sheet", icon: CalendarCheck01 },
    { label: "Customers", icon: Users01 },
    { label: "Products", icon: Tag01 },
    { label: "Reports", icon: BarChart07 },
    { label: "Marketing", icon: Announcement02 },
    {
        label: "Settings",
        icon: Settings01,
        children: [
            { label: "Course" },
            { label: "Online booking" },
            { label: "Crane app", children: [{ label: "App appearance", active: true }, { label: "Notifications" }, { label: "Sign-in & accounts" }] },
            { label: "Payments" },
        ],
    },
];

const NavTree = ({ items, depth = 0 }: { items: NavItem[]; depth?: number }) => (
    <ul className={cx("flex flex-col gap-0.5", depth > 0 && "mt-0.5 ml-[18px] border-l border-secondary pl-2.5")}>
        {items.map((item) => {
            const Icon = item.icon;
            const onPath = !!item.children;
            return (
                <li key={item.label}>
                    <span
                        aria-current={item.active ? "page" : undefined}
                        className={cx(
                            "relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-semibold",
                            item.active
                                ? "bg-brand-primary text-brand-secondary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-fg-brand-primary"
                                : "text-secondary",
                        )}
                    >
                        {Icon && <Icon className={cx("size-5 shrink-0", onPath ? "text-fg-brand-primary" : "text-fg-quaternary")} aria-hidden="true" />}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.children && <ChevronDown className="size-4 shrink-0 rotate-180 text-fg-quaternary" aria-hidden="true" />}
                    </span>
                    {item.children && <NavTree items={item.children} depth={depth + 1} />}
                </li>
            );
        })}
    </ul>
);

const Sidebar = () => (
    <aside {...buckSurface} className={cx(buckSurface.className, "sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-secondary bg-primary")}>
        <div className="flex h-16 shrink-0 items-center px-5">
            <TfLogo height={30} />
        </div>
        <div className="px-3 pb-3">
            <div className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-3 text-sm text-placeholder">
                <SearchLg className="size-4 text-fg-quaternary" aria-hidden="true" />
                Search
                <span className="ml-auto rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-quaternary ring-1 ring-secondary">⌘K</span>
            </div>
        </div>
        <nav aria-label="Buck" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
            <NavTree items={NAV} />
        </nav>
    </aside>
);

const clubName = (p: ClubProfile) => p.displayName ?? courseById(p.courseId).name;

const ClubSwitcher = ({ clubId, onChange }: { clubId: string; onChange: (id: string) => void }) => {
    const current = clubProfileFor(clubId);
    const course = courseById(current.courseId);
    return (
        <AriaMenuTrigger>
            <AriaButton
                aria-label={`Club: ${clubName(current)}. Switch club`}
                className="flex h-11 cursor-pointer items-center gap-3 rounded-lg bg-primary py-1.5 pr-3 pl-1.5 shadow-xs ring-1 ring-secondary outline-none ring-inset transition duration-100 ease-linear hover:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60"
            >
                <CourseLogo course={logoCourse(current, course)} size={32} className="rounded-md" />
                <span className="text-sm font-semibold text-primary">{clubName(current)}</span>
                <ChevronDown className="size-4 text-fg-quaternary" aria-hidden="true" />
            </AriaButton>
            <AriaPopover
                placement="bottom end"
                {...buckSurface}
                className={cx(buckSurface.className, "w-[340px] rounded-xl bg-primary p-1.5 shadow-lg ring-1 ring-secondary_alt outline-none")}
            >
                <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold text-quaternary">Sample clubs</div>
                <AriaMenu aria-label="Switch club" className="flex flex-col gap-0.5 outline-none" onAction={(key) => onChange(String(key))}>
                    {CLUB_PROFILES.map((p) => {
                        const c = courseById(p.courseId);
                        return (
                            <AriaMenuItem
                                key={p.courseId}
                                id={p.courseId}
                                textValue={clubName(p)}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none data-[focused]:bg-primary_hover"
                            >
                                <CourseLogo course={logoCourse(p, c)} size={32} className="rounded-md" />
                                <span className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate text-sm font-semibold text-primary">{clubName(p)}</span>
                                    <span className="truncate text-xs text-tertiary">{p.tagline}</span>
                                </span>
                                <PaletteChip paletteId={p.paletteId} variant="steps" className="h-3 w-9 rounded-full" />
                                {p.courseId === clubId && <Check className="size-4 text-fg-brand-primary" aria-hidden="true" />}
                            </AriaMenuItem>
                        );
                    })}
                </AriaMenu>
            </AriaPopover>
        </AriaMenuTrigger>
    );
};

const TopBar = ({ clubId, onClubChange }: { clubId: string; onClubChange: (id: string) => void }) => (
    <div {...buckSurface} className={cx(buckSurface.className, "sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-secondary bg-primary px-8")}>
        <span className="text-sm text-tertiary">
            Editing the Crane app for <span className="font-semibold text-secondary">{clubName(clubProfileFor(clubId))}</span>
        </span>
        <div className="flex items-center gap-3">
            <ClubSwitcher clubId={clubId} onChange={onClubChange} />
            <span className="flex size-10 items-center justify-center rounded-full text-fg-quaternary" aria-hidden="true">
                <HelpCircle className="size-5" />
            </span>
            <span aria-label="Account" role="img" className="flex size-10 items-center justify-center rounded-full text-fg-secondary ring-2 ring-fg-secondary ring-inset">
                <User01 className="size-5" aria-hidden="true" />
            </span>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Page building blocks                                                 */
/* ------------------------------------------------------------------ */

const STATUS: Record<ReviewStatus, { badge: string; tone: StatusTone }> = {
    live: { badge: "Live", tone: "success" },
    draft: { badge: "Unsaved changes", tone: "warning" },
    saved: { badge: "Draft saved", tone: "gray" },
    "in-review": { badge: "In TenFore review", tone: "warning" },
    approved: { badge: "Approved", tone: "success" },
    published: { badge: "Published", tone: "success" },
};

const SECTIONS: { id: AppearanceSectionId; label: string; icon: FC<{ className?: string }> }[] = [
    { id: "palette", label: "Palette", icon: Palette },
    { id: "hero", label: "Hero photo", icon: Image01 },
    { id: "logo", label: "Logo & name", icon: Type01 },
    { id: "announcements", label: "Announcements", icon: Announcement02 },
];

const sectionDomId = (id: AppearanceSectionId) => `appearance-${id}`;

const SettingsCard = ({
    id,
    step,
    title,
    description,
    edited,
    accessory,
    children,
}: {
    id: AppearanceSectionId;
    step: number;
    title: string;
    description: ReactNode;
    edited?: boolean;
    accessory?: ReactNode;
    children: ReactNode;
}) => (
    <section id={sectionDomId(id)} aria-labelledby={`${sectionDomId(id)}-title`} className="scroll-mt-24 rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
        <header className="flex items-start justify-between gap-4 border-b border-secondary px-6 py-5">
            <div className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary ring-1 ring-secondary ring-inset">{step}</span>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 id={`${sectionDomId(id)}-title`} className="text-lg font-semibold text-primary">
                            {title}
                        </h2>
                        {edited && (
                            <Tag tone="warning" variant="soft">
                                Edited
                            </Tag>
                        )}
                    </div>
                    <p className="mt-0.5 max-w-xl text-sm text-tertiary">{description}</p>
                </div>
            </div>
            {accessory}
        </header>
        <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </section>
);

const FieldLabel = ({ children, hint }: { children: ReactNode; hint?: ReactNode }) => (
    <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-secondary">{children}</span>
        {hint && <span className="text-xs text-tertiary">{hint}</span>}
    </div>
);

const Counter = ({ value, max }: { value: string; max: number }) => (
    <span className={cx("tabular-nums", value.length >= max ? "font-semibold text-warning-primary" : "text-quaternary")}>
        {value.length}/{max}
    </span>
);

/* ------------------------------------------------------------------ */
/* 1. Palette                                                           */
/* ------------------------------------------------------------------ */

const CheckSample = ({ label, paletteId }: { label: string; paletteId: string }) => {
    const r = paletteRamp(paletteId);
    const step = Number(label.match(/\((\d+)\)/)?.[1] ?? 600) as keyof typeof r;
    const colour = r[step] ?? r[600];
    if (/^white text/i.test(label)) {
        return (
            <span className="inline-flex h-6 w-14 items-center justify-center rounded-md text-xs font-semibold text-white" style={{ background: colour }}>
                Book
            </span>
        );
    }
    const dark = /on dark/i.test(label);
    return (
        <span
            className="inline-flex h-6 w-14 items-center justify-center gap-1 rounded-md text-xs font-semibold ring-1 ring-secondary ring-inset"
            style={{ background: dark ? "#0C0E12" : "#FFFFFF", color: colour }}
        >
            {/border/i.test(label) ? <span className="h-3.5 w-8 rounded" style={{ boxShadow: `inset 0 0 0 1.5px ${colour}` }} /> : /icon/i.test(label) ? "● Aa" : "Aa"}
        </span>
    );
};

const PaletteSection = ({
    paletteId,
    onChange,
    checksOpen,
    onChecksOpen,
    edited,
}: {
    paletteId: string;
    onChange: (id: string) => void;
    checksOpen: boolean;
    onChecksOpen: (open: boolean) => void;
    edited: boolean;
}) => {
    const p = paletteById(paletteId);
    const summary = paletteContrastSummary(paletteId);
    return (
        <SettingsCard
            id="palette"
            step={1}
            title="Palette"
            edited={edited}
            description="Pick one of 12 palettes. It colours buttons, links, tabs and badges across the app, in light and dark."
        >
            <AriaRadioGroup aria-label="Palette" value={paletteId} onChange={onChange} className="flex flex-col gap-5">
                {PALETTE_FAMILIES.map((f) => (
                    <div key={f.id} className="flex flex-col gap-2.5">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-secondary">{f.label}</span>
                            <span className="text-xs text-tertiary">{f.blurb}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {CLUB_PALETTES.filter((x) => x.family === f.id).map((x) => (
                                <AriaRadio key={x.id} value={x.id} aria-label={`${x.name}. ${x.blurb}`} className="flex rounded-xl outline-none">
                                    {({ isSelected, isFocusVisible }) => <PaletteSwatch paletteId={x.id} isSelected={isSelected} isFocusVisible={isFocusVisible} />}
                                </AriaRadio>
                            ))}
                        </div>
                    </div>
                ))}
            </AriaRadioGroup>

            <div className="flex flex-col gap-3 rounded-xl bg-secondary p-4" data-selected-palette={p.id}>
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-primary">
                            {p.name} <span className="font-normal text-tertiary">· {p.blurb}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-success-primary" data-contrast-line>
                            <CheckCircle className="size-4 text-fg-success-primary" aria-hidden="true" />
                            Contrast checked: light {summary.light ? "✓" : "✕"} dark {summary.dark ? "✓" : "✕"}
                        </div>
                    </div>
                    <PaletteChip paletteId={p.id} variant="ramp" className="h-7 w-64 shrink-0 rounded-lg" />
                </div>
                <AriaDisclosure isExpanded={checksOpen} onExpandedChange={onChecksOpen} className="group">
                    <AriaButton
                        slot="trigger"
                        className="flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-brand-secondary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
                    >
                        {checksOpen ? "Hide" : "Show"} the {summary.checks.length} checks
                        <ChevronDown className="size-4 transition-transform duration-150 group-data-[expanded]:rotate-180" aria-hidden="true" />
                    </AriaButton>
                    <AriaDisclosurePanel>
                        <table className="mt-3 w-full text-left text-sm">
                            <thead>
                                <tr className="text-xs text-quaternary">
                                    <th className="pb-2 font-medium">Check</th>
                                    <th className="pb-2 font-medium">Mode</th>
                                    <th className="pb-2 font-medium">Sample</th>
                                    <th className="pb-2 text-right font-medium">Ratio</th>
                                    <th className="pb-2 text-right font-medium">Needs</th>
                                    <th className="pb-2 text-right font-medium">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary">
                                {summary.checks.map((c) => (
                                    <tr key={c.label}>
                                        <td className="py-2 pr-3 text-secondary">{c.label}</td>
                                        <td className="py-2 pr-3 text-tertiary capitalize">{checkMode(c)}</td>
                                        <td className="py-2 pr-3">
                                            <CheckSample label={c.label} paletteId={p.id} />
                                        </td>
                                        <td className="py-2 text-right font-semibold text-primary tabular-nums">{c.ratio.toFixed(2)}:1</td>
                                        <td className="py-2 text-right text-tertiary tabular-nums">{c.min}:1</td>
                                        <td className={cx("py-2 text-right font-semibold", c.pass ? "text-success-primary" : "text-error-primary")}>{c.pass ? "Pass" : "Fail"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </AriaDisclosurePanel>
                </AriaDisclosure>
            </div>
            <p className="flex items-center gap-2 text-sm text-tertiary">
                <InfoCircle className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                Palettes are tuned so buttons, links and badges stay readable in light and dark. Custom hex colours aren&rsquo;t available.
            </p>
        </SettingsCard>
    );
};

/* ------------------------------------------------------------------ */
/* 2. Hero photo                                                        */
/* ------------------------------------------------------------------ */

const FocusPicker = ({ photo, focus, onChange }: { photo: { src: string; width: number; height: number; label: string }; focus: FocusPoint; onChange: (f: FocusPoint) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const crop = heroCrop(photo.width / photo.height, focus);
    const fromPointer = (e: PointerEvent) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        onChange({ x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) });
    };
    const onKeyDown = (e: KeyboardEvent) => {
        const step = e.shiftKey ? 0.1 : 0.03;
        const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        const d = moves[e.key];
        if (!d) return;
        e.preventDefault();
        onChange({ x: clamp(focus.x + d[0], 0, 1), y: clamp(focus.y + d[1], 0, 1) });
    };
    return (
        <div
            ref={ref}
            role="group"
            tabIndex={0}
            aria-label={`Focus point: ${Math.round(focus.x * 100)}% across, ${Math.round(focus.y * 100)}% down. Click the photo or use the arrow keys to move it.`}
            data-focus-picker
            onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                fromPointer(e);
            }}
            onPointerMove={(e) => dragging.current && fromPointer(e)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            onKeyDown={onKeyDown}
            className="relative w-full cursor-crosshair touch-none overflow-hidden rounded-lg bg-tertiary outline-none select-none focus-visible:ring-4 focus-visible:ring-brand-300/60"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
            <img src={photo.src} alt={photo.label} draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover" />
            {/* The crop the phone uses; everything outside it is dimmed. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-md shadow-[0_0_0_9999px_rgba(12,14,18,0.55)] ring-2 ring-white transition-[left,top] duration-100 ease-linear"
                style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
            >
                <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold text-white">Phone crop</span>
            </div>
            <span
                aria-hidden="true"
                className="pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 ring-2 ring-white backdrop-blur-[2px]"
                style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }}
            >
                <span className="size-2 rounded-full bg-white shadow" />
            </span>
        </div>
    );
};

/** A small hero crop as the phone shows it: the shade at the bottom and the club's name over it. */
const HeroCropPreview = ({
    src,
    objectPosition,
    name,
    tagline,
    logo,
    aspect = `${HERO_SIZE.width} / ${HERO_SIZE.height}`,
    className,
}: {
    src: string;
    objectPosition: string;
    name: string;
    tagline: string;
    logo: ReactNode;
    aspect?: string;
    className?: string;
}) => (
    <div className={cx("relative overflow-hidden rounded-lg bg-tertiary ring-1 ring-secondary_alt", className)} style={{ aspectRatio: aspect }}>
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.25) 55%, transparent)" }} />
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-end gap-2">
            {logo}
            <div className="min-w-0">
                <div className="truncate text-[12px] leading-tight font-bold text-white">{name}</div>
                {tagline && <div className="truncate text-[10px] leading-tight text-white/85">{tagline}</div>}
            </div>
        </div>
    </div>
);

const QUALITY_TEXT = {
    good: { label: "Sharp on every iPhone", tone: "text-success-primary" },
    low: { label: "Low resolution", tone: "text-warning-primary" },
    unknown: { label: "Checking size…", tone: "text-tertiary" },
} as const;

/** What the focus point can move, given how the photo's shape compares with the header's. */
const focusTravel = (crop: { w: number; h: number }) =>
    crop.w < 0.995 ? "The photo is wider than the header, so the focus point slides the crop left or right." : crop.h < 0.995 ? "The photo is taller than the header, so the focus point slides the crop up or down." : "The photo already fits the header exactly.";

const HeroSection = ({
    hero,
    onChange,
    name,
    tagline,
    logo,
    edited,
    pickerOpen,
    onPickerOpen,
}: {
    hero: HeroState;
    onChange: (h: HeroState) => void;
    name: string;
    tagline: string;
    logo: ReactNode;
    edited: boolean;
    pickerOpen: boolean;
    onPickerOpen: (open: boolean) => void;
}) => {
    const photo = usePhotoSize(resolveHero(hero));
    const crop = heroCrop(photo.width / photo.height, hero.focus);
    const quality = heroQuality(photo.width, photo.height);
    const set = DEFAULT_PHOTO_SETS.find((s) => s.id === hero.setId) ?? DEFAULT_PHOTO_SETS[0];
    const defaultSet = DEFAULT_PHOTO_SETS.find((s) => s.id === TENFORE_DEFAULT_SET);
    const showPhoto = hero.source === "tenfore" || !!hero.uploadId;

    return (
        <SettingsCard
            id="hero"
            step={2}
            title="Hero photo"
            edited={edited}
            description="One great photo at the top of the home screen. Upload your own or use one of TenFore's, then set the focus point so the phone crops it well."
            accessory={
                <SegmentedControl
                    aria-label="Photo source"
                    className="w-64 shrink-0"
                    value={hero.source}
                    onChange={(v) => onChange({ ...hero, source: v as HeroState["source"], focus: CENTER })}
                    options={[
                        { id: "upload", label: "Your photo" },
                        { id: "tenfore", label: "TenFore photo" },
                    ]}
                />
            }
        >
            {hero.source === "upload" && (
                <div className="flex flex-col gap-3">
                    {!hero.uploadId || pickerOpen ? (
                        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary bg-secondary p-4" data-upload-picker>
                            <div className="flex items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                                    <UploadCloud02 className="size-5 text-fg-secondary" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-primary">Upload a photo</div>
                                    <div className="text-xs text-tertiary">JPG or PNG, at least 1200 px wide. Landscape works best. No text or logos in the photo.</div>
                                </div>
                                {hero.uploadId && (
                                    <Button size="web-sm" color="outline" onPress={() => onPickerOpen(false)}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            <div className="text-xs font-medium text-quaternary">Demo: choose one of the sample club photos as the &ldquo;upload&rdquo;.</div>
                            <div className="grid grid-cols-4 gap-2.5">
                                {SAMPLE_UPLOADS.map((u) => (
                                    <AriaButton
                                        key={u.id}
                                        aria-label={`Upload ${u.file}, ${u.width} by ${u.height} pixels`}
                                        onPress={() => {
                                            onChange({ ...hero, source: "upload", uploadId: u.id, focus: CENTER });
                                            onPickerOpen(false);
                                        }}
                                        className={cx(
                                            "group flex cursor-pointer flex-col gap-1 rounded-lg bg-primary p-1.5 text-left ring-1 ring-secondary outline-none ring-inset transition duration-100 ease-linear hover:ring-primary focus-visible:ring-4 focus-visible:ring-brand-300/60",
                                            u.id === hero.uploadId && "ring-2 ring-brand",
                                        )}
                                    >
                                        <img src={u.src} alt="" className="aspect-[3/2] w-full rounded object-cover" />
                                        <span className="truncate px-0.5 text-xs font-medium text-secondary">{u.file}</span>
                                        <span className={cx("px-0.5 text-[11px] tabular-nums", heroQuality(u.width, u.height).level === "low" ? "font-semibold text-warning-primary" : "text-quaternary")}>
                                            {u.width} × {u.height}
                                        </span>
                                    </AriaButton>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2 text-sm">
                                <Image01 className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                <span className="truncate font-medium text-secondary">{photo.label}</span>
                                <span className="text-tertiary tabular-nums">
                                    {photo.width} × {photo.height} px
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="web-sm" color="outline" iconLeading={UploadCloud02} onPress={() => onPickerOpen(true)}>
                                    Replace photo
                                </Button>
                                <Button size="web-sm" color="outline" onPress={() => onChange({ ...hero, uploadId: undefined, focus: CENTER })}>
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {hero.source === "upload" && quality.level === "low" && photo.upload && !pickerOpen && (
                <Notice tone="warning" title="This photo is low resolution">
                    {quality.message} Or pick a TenFore photo.
                </Notice>
            )}

            {hero.source === "tenfore" && (
                <div className="flex flex-col gap-3" data-tenfore-picker>
                    <AriaRadioGroup
                        aria-label="TenFore photo set"
                        value={hero.setId}
                        onChange={(v) => onChange({ ...hero, setId: v as DefaultPhotoSetId, setPhoto: 0, focus: CENTER })}
                        className="grid grid-cols-3 gap-3"
                    >
                        {DEFAULT_PHOTO_SETS.map((s) => (
                            <AriaRadio key={s.id} value={s.id} aria-label={`${s.label}. ${s.blurb}`} className="flex rounded-xl outline-none">
                                {({ isSelected, isFocusVisible }) => (
                                    <span
                                        className={cx(
                                            "relative flex w-full cursor-pointer flex-col gap-2 rounded-xl bg-primary p-1.5 pb-2 ring-1 ring-secondary ring-inset transition duration-100 ease-linear hover:ring-primary",
                                            isSelected && "ring-2 ring-brand hover:ring-brand",
                                            isFocusVisible && "outline-4 outline-offset-2 outline-brand-300/60",
                                        )}
                                    >
                                        <img src={setPhotos(s.id)[0]} alt="" className="aspect-[3/2] w-full rounded-lg object-cover" />
                                        <span className="flex flex-col px-1">
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                                {s.label}
                                                {s.id === TENFORE_DEFAULT_SET && (
                                                    <Tag tone="gray" variant="soft">
                                                        Default
                                                    </Tag>
                                                )}
                                            </span>
                                            <span className="truncate text-xs text-tertiary">{s.blurb}</span>
                                        </span>
                                        {isSelected && (
                                            <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white ring-2 ring-white">
                                                <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                                            </span>
                                        )}
                                    </span>
                                )}
                            </AriaRadio>
                        ))}
                    </AriaRadioGroup>
                    <div className="flex flex-col gap-2">
                        <FieldLabel hint="Composed for the phone crop, with no logos or text.">Photos in {set.label}</FieldLabel>
                        <AriaRadioGroup
                            aria-label={`${set.label} photos`}
                            value={String(hero.setPhoto)}
                            onChange={(v) => onChange({ ...hero, setPhoto: Number(v), focus: CENTER })}
                            className="grid grid-cols-5 gap-2"
                        >
                            {setPhotos(hero.setId).map((src, i) => (
                                <AriaRadio key={src} value={String(i)} aria-label={`${set.label} photo ${i + 1}`} className="flex rounded-lg outline-none">
                                    {({ isSelected, isFocusVisible }) => (
                                        <img
                                            src={src}
                                            alt=""
                                            className={cx(
                                                "aspect-[3/2] w-full cursor-pointer rounded-lg object-cover ring-offset-2 transition duration-100 ease-linear",
                                                isSelected ? "ring-2 ring-brand" : "opacity-80 hover:opacity-100",
                                                isFocusVisible && "outline-4 outline-offset-2 outline-brand-300/60",
                                            )}
                                        />
                                    )}
                                </AriaRadio>
                            ))}
                        </AriaRadioGroup>
                    </div>
                </div>
            )}

            {showPhoto && (
                <div className="grid grid-cols-[minmax(0,1fr)_184px] gap-5 border-t border-secondary pt-5">
                    <div className="flex flex-col gap-2">
                        <FieldLabel hint="Click the photo, drag, or use the arrow keys.">
                            <span className="inline-flex items-center gap-1.5">
                                <Target04 className="size-4 text-fg-quaternary" aria-hidden="true" />
                                Focus point
                            </span>
                        </FieldLabel>
                        <FocusPicker photo={photo} focus={hero.focus} onChange={(focus) => onChange({ ...hero, focus })} />
                        <p className="text-xs text-tertiary">{focusTravel(crop)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <FieldLabel>On the phone</FieldLabel>
                        <HeroCropPreview src={photo.src} objectPosition={crop.objectPosition} name={name} tagline={tagline} logo={logo} />
                        <div className="text-xs">
                            <div className={cx("font-semibold", QUALITY_TEXT[quality.level].tone)}>{QUALITY_TEXT[quality.level].label}</div>
                            <div className="text-tertiary tabular-nums">
                                {photo.width} × {photo.height} px · focus {Math.round(hero.focus.x * 100)}%, {Math.round(hero.focus.y * 100)}%
                            </div>
                        </div>
                        <Button size="web-sm" color="outline" isDisabled={sameHero(hero, { ...hero, focus: CENTER })} onPress={() => onChange({ ...hero, focus: CENTER })}>
                            Reset to centre
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                {hero.source === "upload" && !hero.uploadId && (
                    <Notice tone="info" title="No photo uploaded">
                        Until you add one, golfers see TenFore&rsquo;s {defaultSet?.label ?? "default"} photos.
                    </Notice>
                )}
                <div className="grid grid-cols-2 gap-2">
                    <Notice tone="info" title="Always readable">
                        We add a soft shade behind the text so it always reads. Its strength is measured from each photo.
                    </Notice>
                    <Notice tone="info" title={"If there’s no photo"}>
                        If a photo is removed or doesn&rsquo;t load, the app shows TenFore&rsquo;s {defaultSet?.label ?? "default"} photos, never a blank header or a logo.
                    </Notice>
                </div>
            </div>
        </SettingsCard>
    );
};

/* ------------------------------------------------------------------ */
/* 3. Logo & name                                                       */
/* ------------------------------------------------------------------ */

const Mini = ({ label, caption, children }: { label: string; caption: string; children: ReactNode }) => (
    <figure className="flex flex-col gap-2">
        <div className="flex h-[168px] items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary ring-inset">{children}</div>
        <figcaption>
            <div className="text-xs font-semibold text-secondary">{label}</div>
            <div className="text-xs text-tertiary">{caption}</div>
        </figcaption>
    </figure>
);

const LogoNameSection = ({
    paletteId,
    logoFor,
    name,
    tagline,
    iconName,
    onName,
    onTagline,
    onIconName,
    heroSrc,
    heroPosition,
    edited,
}: {
    paletteId: string;
    logoFor: (size: number, className?: string) => ReactNode;
    name: string;
    tagline: string;
    iconName: string;
    onName: (v: string) => void;
    onTagline: (v: string) => void;
    onIconName: (v: string) => void;
    heroSrc: string;
    heroPosition: string;
    edited: boolean;
}) => {
    const [replaceNote, setReplaceNote] = useState(false);
    return (
        <SettingsCard id="logo" step={3} title="Logo & name" edited={edited} description="Your logo always sits on a white tile, so it works with any palette and any photo.">
            <div className="grid grid-cols-[176px_minmax(0,1fr)] gap-6">
                <div className="flex flex-col items-start gap-3">
                    <div className="flex size-[176px] items-center justify-center rounded-xl bg-secondary ring-1 ring-secondary ring-inset">{logoFor(112, "rounded-2xl shadow-sm")}</div>
                    <Button size="web-sm" color="outline" iconLeading={UploadCloud02} onPress={() => setReplaceNote((v) => !v)}>
                        Replace logo
                    </Button>
                    <p className="text-xs text-tertiary">{replaceNote ? "Uploads are simulated in this mock." : "Square PNG or SVG, at least 512 × 512 px."}</p>
                </div>
                <div className="flex flex-col gap-4">
                    <TextField
                        label="Display name"
                        value={name}
                        onChange={onName}
                        maxLength={LIMITS.name}
                        hint={
                            <span className="flex justify-between gap-3">
                                <span>On the home header and the splash screen.</span>
                                <Counter value={name} max={LIMITS.name} />
                            </span>
                        }
                    />
                    <TextField
                        label="Tagline"
                        value={tagline}
                        onChange={onTagline}
                        maxLength={LIMITS.tagline}
                        hint={
                            <span className="flex justify-between gap-3">
                                <span>One line under the name, e.g. the town and a founding year.</span>
                                <Counter value={tagline} max={LIMITS.tagline} />
                            </span>
                        }
                    />
                    <TextField
                        label="App icon name"
                        value={iconName}
                        onChange={onIconName}
                        maxLength={LIMITS.iconName}
                        hint={
                            <span className="flex justify-between gap-3">
                                <span>Under the app icon. Phones show about 12 characters.</span>
                                <Counter value={iconName} max={LIMITS.iconName} />
                            </span>
                        }
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2.5 border-t border-secondary pt-5">
                <FieldLabel hint="Shown in the club's palette.">Where they appear</FieldLabel>
                <ClubTheme paletteId={paletteId}>
                    <div className="grid grid-cols-3 gap-3">
                        <Mini label="Home header" caption="Logo, name and tagline over the hero photo.">
                            <div className="w-[200px]">
                                <HeroCropPreview src={heroSrc} objectPosition={heroPosition} name={name} tagline={tagline} logo={logoFor(26, "rounded-md")} />
                            </div>
                        </Mini>
                        <Mini label="Splash screen" caption="While the app opens, on the palette colour.">
                            <div className="flex h-[148px] w-[72px] flex-col items-center justify-center gap-2 rounded-[14px] bg-brand-solid px-2 shadow-sm ring-2 ring-secondary_alt">
                                {logoFor(36, "rounded-lg")}
                                <span className="line-clamp-2 text-center text-[8px] leading-tight font-semibold text-white">{name}</span>
                            </div>
                        </Mini>
                        <Mini label="App icon" caption="The logo on white, with the app icon name.">
                            <div className="relative flex size-full items-center justify-center overflow-hidden">
                                <img src={heroSrc} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover blur-md" />
                                <div className="relative flex flex-col items-center gap-1.5">
                                    <span className="flex size-[60px] items-center justify-center overflow-hidden rounded-[14px] bg-white shadow-md">{logoFor(52, "ring-0")}</span>
                                    <span className="max-w-[84px] truncate text-[11px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{iconName || " "}</span>
                                </div>
                            </div>
                        </Mini>
                    </div>
                </ClubTheme>
            </div>
        </SettingsCard>
    );
};

/* ------------------------------------------------------------------ */
/* 4. Announcements                                                     */
/* ------------------------------------------------------------------ */

const EMPTY_DRAFT: PostDraft = { kind: "news", title: "", body: "", imageId: "none", withButton: false, buttonId: "book", expiry: "none" };

const TextArea = ({ label, value, onChange, maxLength, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; maxLength: number; placeholder?: string; hint?: ReactNode }) => (
    <AriaTextField value={value} onChange={onChange} maxLength={maxLength} className="group flex flex-col gap-1.5">
        <AriaLabel className="px-0.5 text-sm font-medium text-secondary">{label}</AriaLabel>
        <AriaTextArea
            placeholder={placeholder}
            rows={3}
            className="min-h-[88px] resize-none rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand"
        />
        {hint && (
            <AriaText slot="description" className="px-0.5 text-xs text-tertiary">
                {hint}
            </AriaText>
        )}
    </AriaTextField>
);

const PillChoice = <T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) => (
    <AriaRadioGroup aria-label={label} value={value} onChange={(v) => onChange(v as T)} orientation="horizontal" className="flex flex-wrap gap-2">
        {options.map((o) => (
            <AriaRadio
                key={o.id}
                value={o.id}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-secondary ring-1 ring-primary outline-none ring-inset transition duration-100 ease-linear data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-primary_alt data-[selected]:text-brand-secondary data-[selected]:ring-brand"
            >
                {({ isSelected }) => (
                    <>
                        {isSelected && <Check className="size-3.5" aria-hidden="true" />}
                        {o.label}
                    </>
                )}
            </AriaRadio>
        ))}
    </AriaRadioGroup>
);

const Composer = ({ initial, onPost, onCancel }: { initial: PostDraft; onPost: (d: PostDraft) => void; onCancel: () => void }) => {
    const [d, setD] = useState(initial);
    const set = (patch: Partial<PostDraft>) => setD((x) => ({ ...x, ...patch }));
    const expiryOn = d.expiry === "week" ? addDays(TODAY, 7) : d.expiry === "month" ? endOfMonth(TODAY) : undefined;
    return (
        <div data-composer className="flex flex-col gap-4 rounded-xl bg-primary p-5 shadow-sm ring-2 ring-brand ring-inset">
            <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-primary">New post</h3>
                <span className="text-xs text-tertiary">Goes live as soon as you post it.</span>
            </div>
            <div className="flex flex-col gap-2">
                <FieldLabel>Kind</FieldLabel>
                <PillChoice
                    label="Kind"
                    value={d.kind}
                    onChange={(kind) => set({ kind })}
                    options={(Object.keys(KIND) as FeedPost["kind"][]).map((k) => ({ id: k, label: KIND[k].label }))}
                />
            </div>
            <TextField
                label="Title"
                value={d.title}
                onChange={(title) => set({ title })}
                maxLength={LIMITS.postTitle}
                placeholder="e.g. Course closed Thanksgiving Day"
                hint={
                    <span className="flex justify-end">
                        <Counter value={d.title} max={LIMITS.postTitle} />
                    </span>
                }
            />
            <TextArea
                label="Message"
                value={d.body}
                onChange={(body) => set({ body })}
                maxLength={LIMITS.postBody}
                placeholder="A sentence or two. Golfers see it on the home screen."
                hint={
                    <span className="flex justify-end">
                        <Counter value={d.body} max={LIMITS.postBody} />
                    </span>
                }
            />
            <div className="flex flex-col gap-2">
                <FieldLabel hint="Optional">Image</FieldLabel>
                <AriaRadioGroup aria-label="Post image" value={d.imageId} onChange={(imageId) => set({ imageId })} orientation="horizontal" className="flex gap-2">
                    <AriaRadio value="none" className="flex rounded-lg outline-none">
                        {({ isSelected, isFocusVisible }) => (
                            <span
                                className={cx(
                                    "flex h-[52px] w-[78px] cursor-pointer items-center justify-center rounded-lg bg-secondary text-xs font-medium text-tertiary ring-1 ring-secondary ring-inset",
                                    isSelected && "bg-brand-primary_alt text-brand-secondary ring-2 ring-brand",
                                    isFocusVisible && "outline-4 outline-offset-2 outline-brand-300/60",
                                )}
                            >
                                No image
                            </span>
                        )}
                    </AriaRadio>
                    {SAMPLE_UPLOADS.filter((u) => u.id !== LOW_RES_SAMPLE_ID)
                        .slice(0, 6)
                        .map((u) => (
                            <AriaRadio key={u.id} value={u.id} aria-label={u.file} className="flex rounded-lg outline-none">
                                {({ isSelected, isFocusVisible }) => (
                                    <img
                                        src={u.src}
                                        alt=""
                                        className={cx(
                                            "h-[52px] w-[78px] cursor-pointer rounded-lg object-cover",
                                            isSelected ? "ring-2 ring-brand ring-offset-2" : "opacity-80 hover:opacity-100",
                                            isFocusVisible && "outline-4 outline-offset-2 outline-brand-300/60",
                                        )}
                                    />
                                )}
                            </AriaRadio>
                        ))}
                </AriaRadioGroup>
            </div>
            <div className="flex flex-col gap-2">
                <Switch isSelected={d.withButton} onChange={(withButton) => set({ withButton })} className="self-start">
                    <span className="text-sm font-semibold text-secondary">Add a button</span>
                </Switch>
                {d.withButton && (
                    <PillChoice label="Button" value={d.buttonId} onChange={(buttonId) => set({ buttonId })} options={POST_BUTTONS.map((b) => ({ id: b.id, label: b.label }))} />
                )}
            </div>
            <div className="flex flex-col gap-2">
                <FieldLabel hint={expiryOn ? `Hidden after ${shortDate(expiryOn)}` : "Stays until you remove it"}>Ends</FieldLabel>
                <SegmentedControl
                    aria-label="Ends"
                    className="max-w-md"
                    value={d.expiry}
                    onChange={(v) => set({ expiry: v as PostDraft["expiry"] })}
                    options={[
                        { id: "none", label: "No end date" },
                        { id: "week", label: "In 1 week" },
                        { id: "month", label: "End of month" },
                    ]}
                />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-secondary pt-4">
                <Button size="web-md" color="outline" onPress={onCancel}>
                    Cancel
                </Button>
                <Button size="web-md" iconLeading={Send01} isDisabled={d.title.trim().length < 3} onPress={() => onPost(d)}>
                    Post now
                </Button>
            </div>
        </div>
    );
};

const PostRow = ({ post, isNew, onTogglePin }: { post: FeedPost; isNew: boolean; onTogglePin: () => void }) => {
    const expired = !!post.expiresOn && post.expiresOn < TODAY;
    const k = KIND[post.kind];
    return (
        <li className={cx("flex gap-4 py-4", expired && "opacity-60")} data-post={post.id}>
            {post.image ? (
                <img src={post.image} alt="" className="h-[60px] w-[84px] shrink-0 rounded-lg object-cover ring-1 ring-secondary_alt" />
            ) : (
                <span className="flex h-[60px] w-[84px] shrink-0 items-center justify-center rounded-lg bg-secondary ring-1 ring-secondary ring-inset">
                    <Announcement02 className="size-5 text-fg-quaternary" aria-hidden="true" />
                </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Tag tone={k.tone} variant="soft">
                        {k.label}
                    </Tag>
                    {post.pinned && (
                        <Tag tone="brand" icon={Pin01}>
                            Pinned
                        </Tag>
                    )}
                    {expired && (
                        <Tag tone="gray" variant="soft">
                            Expired
                        </Tag>
                    )}
                    {isNew && (
                        <Tag tone="success" variant="soft">
                            Just posted
                        </Tag>
                    )}
                </div>
                <div className="truncate text-sm font-semibold text-primary">{post.title}</div>
                <p className="line-clamp-2 text-sm text-tertiary">{post.body}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-quaternary">
                    <span>Posted {shortDate(post.postedOn)}</span>
                    <span className="flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {post.expiresOn ? `${expired ? "Ended" : "Ends"} ${shortDate(post.expiresOn)}` : "No end date"}
                    </span>
                    {post.cta && <span>Button: {post.cta.label}</span>}
                </div>
            </div>
            <div className="flex shrink-0 items-start">
                <Button size="web-sm" color={post.pinned ? "tinted" : "outline"} iconLeading={Pin01} onPress={onTogglePin} isDisabled={expired} aria-label={`${post.pinned ? "Unpin" : "Pin"} ${post.title}`}>
                    {post.pinned ? "Unpin" : "Pin"}
                </Button>
            </div>
        </li>
    );
};

const AnnouncementsSection = ({
    feed,
    onFeed,
    composer,
    onComposer,
    newIds,
    onPosted,
}: {
    feed: FeedPost[];
    onFeed: (f: FeedPost[]) => void;
    composer: PostDraft | null;
    onComposer: (d: PostDraft | null) => void;
    newIds: string[];
    onPosted: (id: string) => void;
}) => {
    const sorted = sortFeed(feed);
    const post = (d: PostDraft) => {
        const id = `new-${feed.length + 1}-${newIds.length}`;
        const img = SAMPLE_UPLOADS.find((u) => u.id === d.imageId);
        const btn = POST_BUTTONS.find((b) => b.id === d.buttonId);
        const next: FeedPost = {
            id,
            kind: d.kind,
            title: d.title.trim(),
            body: d.body.trim(),
            image: img?.src,
            postedOn: TODAY,
            expiresOn: d.expiry === "week" ? addDays(TODAY, 7) : d.expiry === "month" ? endOfMonth(TODAY) : undefined,
            cta: d.withButton && btn ? { label: btn.label, href: btn.href } : undefined,
        };
        onFeed([next, ...feed]);
        onPosted(id);
        onComposer(null);
    };
    // One pinned post at a time: pinning a post unpins the other.
    const togglePin = (id: string) => {
        const pin = !feed.find((p) => p.id === id)?.pinned;
        onFeed(feed.map((p) => ({ ...p, pinned: p.id === id ? pin : pin ? false : p.pinned })));
    };
    return (
        <SettingsCard
            id="announcements"
            step={4}
            title="Announcements"
            description="Short posts on the home screen: course updates, events and offers. They go live right away and don't wait for TenFore review."
            accessory={
                !composer && (
                    <Button size="web-md" iconLeading={Plus} onPress={() => onComposer({ ...EMPTY_DRAFT })}>
                        New post
                    </Button>
                )
            }
        >
            {composer && <Composer initial={composer} onPost={post} onCancel={() => onComposer(null)} />}
            <div>
                <div className="flex items-center justify-between text-xs text-tertiary">
                    <span>
                        {sorted.length} {sorted.length === 1 ? "post" : "posts"} · one pinned post stays on top until you unpin it
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye className="size-3.5" aria-hidden="true" />
                        Golfers see the newest 5
                    </span>
                </div>
                <ul className="divide-y divide-secondary">
                    {sorted.map((p) => (
                        <PostRow key={p.id} post={p} isNew={newIds.includes(p.id)} onTogglePin={() => togglePin(p.id)} />
                    ))}
                </ul>
            </div>
        </SettingsCard>
    );
};

/* ------------------------------------------------------------------ */
/* Footer: save, review, publish                                        */
/* ------------------------------------------------------------------ */

const StatusLine = ({ status, reviewRequired, onApprove }: { status: ReviewStatus; reviewRequired: boolean; onApprove: () => void }) => {
    const review = reviewRequired ? " TenFore reviews changes within 1 business day." : "";
    const lines: Record<ReviewStatus, { icon: FC<{ className?: string }>; tone: string; text: ReactNode }> = {
        live: { icon: CheckCircle, tone: "text-fg-success-primary", text: "Everything here is live in the app." },
        draft: { icon: AlertTriangle, tone: "text-fg-warning-primary", text: `Unsaved changes. Golfers won't see them until they're published.${review}` },
        saved: { icon: Clock, tone: "text-fg-quaternary", text: `Draft saved at 4:12 PM. Golfers won't see it until it's published.${review}` },
        "in-review": {
            icon: Clock,
            tone: "text-fg-warning-primary",
            text: (
                <>
                    Submitted for TenFore review today at 4:20 PM. TenFore reviews changes within 1 business day.{" "}
                    <AriaButton onPress={onApprove} className="cursor-pointer font-semibold text-brand-secondary underline outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60">
                        Simulate approval
                    </AriaButton>
                </>
            ),
        },
        approved: { icon: CheckCircle, tone: "text-fg-success-primary", text: "Approved by TenFore. Publish when you're ready." },
        published: { icon: CheckCircle, tone: "text-fg-success-primary", text: "Published. Golfers see it the next time they open the app." },
    };
    const l = lines[status];
    return (
        <p className="flex min-w-0 items-start gap-2 text-sm text-secondary" data-review-status={status} role="status">
            <l.icon className={cx("mt-0.5 size-4 shrink-0", l.tone)} aria-hidden="true" />
            <span>{l.text}</span>
        </p>
    );
};

const ReviewFooter = ({
    status,
    reviewRequired,
    onSave,
    onSubmit,
    onApprove,
    onPublish,
}: {
    status: ReviewStatus;
    reviewRequired: boolean;
    onSave: () => void;
    onSubmit: () => void;
    onApprove: () => void;
    onPublish: () => void;
}) => {
    const pending = status === "draft" || status === "saved";
    const canPublish = reviewRequired ? status === "approved" : pending;
    return (
        <div
            {...buckSurface}
            className={cx(buckSurface.className, "sticky bottom-0 z-20 flex items-center justify-between gap-6 border-t border-secondary bg-primary px-8 py-3.5 shadow-[0_-4px_12px_rgba(16,24,40,0.05)]")}
        >
            <StatusLine status={status} reviewRequired={reviewRequired} onApprove={onApprove} />
            <div className="flex shrink-0 items-center gap-3">
                <Button size="web-md" color="outline" isDisabled={status !== "draft"} onPress={onSave}>
                    {status === "saved" ? "Draft saved" : "Save draft"}
                </Button>
                {reviewRequired && (
                    <Button size="web-md" color={pending ? "filled" : "outline"} iconLeading={pending ? Send01 : undefined} isDisabled={!pending} onPress={onSubmit}>
                        {status === "in-review" ? "Submitted for review" : status === "approved" ? "Approved" : "Submit for TenFore review"}
                    </Button>
                )}
                <Button size="web-md" color={canPublish ? "filled" : "outline"} isDisabled={!canPublish} onPress={onPublish}>
                    Publish
                </Button>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Preview                                                              */
/* ------------------------------------------------------------------ */

/** The device frame: 402 × 874 plus a 13 pt bezel. */
const FRAME = CLUB_PREVIEW_SIZE.device;

/** The default preview: the themed club home, at full size (PreviewPanel scales it). */
export const clubHomePreview = (s: AppearancePreviewState) => (
    <ClubHomePreview profile={s.profile} paletteId={s.paletteId} heroPhoto={s.heroPhoto} heroFocus={s.heroFocus} dark={s.dark} screen={s.screen} />
);

const PreviewPanel = ({
    state,
    onDark,
    onScreen,
    render,
    scale,
}: {
    state: AppearancePreviewState;
    onDark: (d: boolean) => void;
    onScreen: (s: AppearancePreviewState["screen"]) => void;
    render: (s: AppearancePreviewState) => ReactNode;
    scale: number;
}) => (
    <aside aria-label="Live preview" className="sticky top-[88px] flex flex-col items-center gap-2.5 self-start" style={{ width: FRAME.width * scale }}>
        <div {...buckSurface} className={cx(buckSurface.className, "flex w-full flex-col gap-2")}>
            <div className="text-xs text-tertiary">
                <span className="font-semibold text-primary">Live preview</span> · only you see it until it&rsquo;s published
            </div>
            <div className="flex gap-2">
                <SegmentedControl
                    aria-label="Preview screen"
                    value={state.screen}
                    onChange={(v) => onScreen(v as AppearancePreviewState["screen"])}
                    options={[
                        { id: "home", label: "Home" },
                        { id: "feed", label: "Feed" },
                    ]}
                />
                <SegmentedControl
                    aria-label="Preview appearance"
                    value={state.dark ? "dark" : "light"}
                    onChange={(v) => onDark(v === "dark")}
                    options={[
                        { id: "light", label: "Light" },
                        { id: "dark", label: "Dark" },
                    ]}
                />
            </div>
        </div>
        <div
            data-preview
            data-preview-palette={state.paletteId}
            data-preview-dark={state.dark || undefined}
            data-preview-screen={state.screen}
            style={{ width: FRAME.width * scale, height: FRAME.height * scale }}
        >
            <div style={{ width: FRAME.width, height: FRAME.height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{render(state)}</div>
        </div>
    </aside>
);

/* ------------------------------------------------------------------ */
/* The editor (one club) and the page                                   */
/* ------------------------------------------------------------------ */

interface EditorProps extends Omit<AppAppearancePageProps, "clubId"> {
    profile: ClubProfile;
    /** Apply the initial* overrides (only for the club the page opened on). */
    useOverrides: boolean;
}

const Editor = ({
    profile,
    useOverrides,
    initialPaletteId,
    initialChecksOpen,
    initialHero,
    initialComposer,
    initialStatus,
    initialDark,
    initialPreviewScreen = "home",
    reviewRequired = true,
    focusSection,
    renderPreview = clubHomePreview,
    previewScale = 0.73,
}: EditorProps) => {
    const course = courseById(profile.courseId);
    const liveName = profile.displayName ?? course.name;
    const liveHero = useMemo(() => heroFromProfile(profile), [profile]);
    const o = useOverrides;

    const [paletteId, setPaletteId] = useState((o && initialPaletteId) || profile.paletteId);
    const [checksOpen, setChecksOpen] = useState(!!(o && initialChecksOpen));
    // A different photo starts centred, like picking one by hand does.
    const [hero, setHero] = useState<HeroState>(() =>
        o && initialHero ? { ...liveHero, focus: initialHero.source && initialHero.source !== liveHero.source ? CENTER : liveHero.focus, ...initialHero } : liveHero,
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [name, setName] = useState(liveName);
    const [tagline, setTagline] = useState(profile.tagline);
    const [iconName, setIconName] = useState(iconNameFor(liveName));
    const [feed, setFeed] = useState(profile.feed);
    const [newIds, setNewIds] = useState<string[]>([]);
    const [composer, setComposer] = useState<PostDraft | null>(() =>
        o && initialComposer ? { ...EMPTY_DRAFT, ...(typeof initialComposer === "object" ? initialComposer : {}) } : null,
    );
    const [dark, setDark] = useState(!!(o && initialDark));
    const [previewScreen, setPreviewScreen] = useState<AppearancePreviewState["screen"]>(o ? initialPreviewScreen : "home");

    const edited = {
        palette: paletteId !== profile.paletteId,
        hero: !sameHero(hero, liveHero),
        logo: name !== liveName || tagline !== profile.tagline || iconName !== iconNameFor(liveName),
    };
    const anyEdit = edited.palette || edited.hero || edited.logo;
    const [status, setStatus] = useState<ReviewStatus>(() => (o && initialStatus) || (anyEdit ? "draft" : "live"));

    // Any change to a reviewed setting (palette, photo, logo and name) makes a new draft.
    const edit =
        <T,>(set: (v: T) => void) =>
        (v: T) => {
            set(v);
            setStatus("draft");
        };

    useEffect(() => {
        // On mount only: a story's starting scroll position.
        if (focusSection) document.getElementById(sectionDomId(focusSection))?.scrollIntoView({ block: "start" });
    }, []);

    const photo = usePhotoSize(resolveHero(hero));
    const crop = heroCrop(photo.width / photo.height, hero.focus);
    const logoFor = (size: number, className?: string) => <CourseLogo course={logoCourse(profile, course)} size={size} className={className} />;

    const previewState: AppearancePreviewState = {
        profile: {
            ...profile,
            // Only a real rename becomes a display name (logos follow `logoOrg`, so a rename keeps them).
            displayName: name.trim() && name !== course.name ? name : profile.displayName,
            tagline,
            paletteId,
            heroPhoto: photo.isFallback ? undefined : photo.src,
            heroFocus: hero.focus,
            feed: sortFeed(feed),
        },
        course,
        paletteId,
        heroPhoto: photo.isFallback ? null : photo.src,
        heroFocus: hero.focus,
        dark,
        screen: previewScreen,
    };

    return (
        <>
            <div className="flex flex-1 flex-col">
                <header {...buckSurface} className={cx(buckSurface.className, "border-b border-secondary bg-primary px-8 pt-5")}>
                    <div className="mb-4 flex items-center gap-2 text-xs font-medium text-tertiary">
                        {["Settings", "Crane app", "App appearance"].map((c, i) => (
                            <span key={c} className="flex items-center gap-2">
                                {i > 0 && <ChevronRight aria-hidden="true" className="size-3" />}
                                <span className={cx(i === 2 && "text-secondary")}>{c}</span>
                            </span>
                        ))}
                    </div>
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-display-xs font-semibold tracking-tight text-primary">App appearance</h1>
                                <Tag tone="brand" variant="soft">
                                    Beta
                                </Tag>
                            </div>
                            <p className="mt-1.5 max-w-2xl text-sm text-tertiary">
                                How {name || liveName} looks in the TenFore Crane app. Four settings, each tuned so the app always looks right. Golfers see your choices; they can&rsquo;t change them.
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                            <StatusBadge tone={STATUS[status].tone}>{STATUS[status].badge}</StatusBadge>
                            <span className="text-xs text-quaternary">{status === "published" ? "Published today" : "Last published Oct 2"}</span>
                        </div>
                    </div>
                    <nav aria-label="Sections" className="mt-5 flex gap-6">
                        {SECTIONS.map((s) => (
                            <a
                                key={s.id}
                                href={`#${sectionDomId(s.id)}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById(sectionDomId(s.id))?.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="flex items-center gap-2 border-b-2 border-transparent pb-3 text-sm font-semibold text-quaternary transition duration-100 ease-linear outline-none hover:border-secondary hover:text-secondary focus-visible:text-secondary"
                            >
                                <s.icon className="size-4" aria-hidden="true" />
                                {s.label}
                                {s.id !== "announcements" && edited[s.id] && (
                                    <>
                                        <span className="size-1.5 rounded-full bg-fg-warning-secondary" aria-hidden="true" />
                                        <span className="sr-only">(edited)</span>
                                    </>
                                )}
                            </a>
                        ))}
                    </nav>
                </header>

                <div className="flex flex-1 gap-8 px-8 py-6">
                    <div {...buckSurface} className={cx(buckSurface.className, "flex min-w-0 flex-1 flex-col gap-6 pb-6")}>
                        <PaletteSection paletteId={paletteId} onChange={edit(setPaletteId)} checksOpen={checksOpen} onChecksOpen={setChecksOpen} edited={edited.palette} />
                        <HeroSection
                            hero={hero}
                            onChange={edit(setHero)}
                            name={name || liveName}
                            tagline={tagline}
                            logo={logoFor(26, "rounded-md")}
                            edited={edited.hero}
                            pickerOpen={pickerOpen}
                            onPickerOpen={setPickerOpen}
                        />
                        <LogoNameSection
                            paletteId={paletteId}
                            logoFor={logoFor}
                            name={name}
                            tagline={tagline}
                            iconName={iconName}
                            onName={edit(setName)}
                            onTagline={edit(setTagline)}
                            onIconName={edit(setIconName)}
                            heroSrc={photo.src}
                            heroPosition={crop.objectPosition}
                            edited={edited.logo}
                        />
                        <AnnouncementsSection
                            feed={feed}
                            onFeed={setFeed}
                            composer={composer}
                            onComposer={setComposer}
                            newIds={newIds}
                            onPosted={(id) => setNewIds((x) => [...x, id])}
                        />
                    </div>
                    <PreviewPanel state={previewState} onDark={setDark} onScreen={setPreviewScreen} render={renderPreview} scale={previewScale} />
                </div>
            </div>
            <ReviewFooter
                status={status}
                reviewRequired={reviewRequired}
                onSave={() => setStatus("saved")}
                onSubmit={() => setStatus("in-review")}
                onApprove={() => setStatus("approved")}
                onPublish={() => setStatus("published")}
            />
        </>
    );
};

/**
 * Buck › Settings › Crane app › App appearance. Pick a club in the top bar to load its profile; every
 * setting is local state. See the file comment for the why.
 */
export const AppAppearancePage = ({ clubId = "sagamore-spring", ...props }: AppAppearancePageProps) => {
    const [current, setCurrent] = useState(clubId);
    const profile = clubProfileFor(current);
    return (
        <div className="flex min-h-screen bg-secondary text-primary antialiased" data-app-appearance={current}>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar clubId={current} onClubChange={setCurrent} />
                <Editor key={current} profile={profile} useOverrides={current === clubId} {...props} />
            </div>
        </div>
    );
};
