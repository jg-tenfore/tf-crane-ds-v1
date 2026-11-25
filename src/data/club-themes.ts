/**
 * Club themes: R&D for customizing white-label Crane installs (Nov 24, 2026 call with Weston).
 *
 * The idea: a course doesn't type hex codes. It picks one of 12 curated palettes in Buck's "App
 * appearance" page, uploads (or picks) one great hero photo, adds its logo, and posts announcements
 * to a feed. Each palette is a single anchor colour; the full brand ramp is generated from it
 * (src/utils/color-ramp.ts) and checked for contrast in light and dark, so every palette looks right
 * everywhere a brand token is used. Golfers never pick a theme; they see their course's.
 *
 * Applied with <ClubTheme> (src/components/club-theme/club-theme.tsx).
 */
import { contrast, rampFrom, RAMP_STEPS, type Ramp } from "@/utils/color-ramp";

export type PaletteFamily = "greens" | "classic" | "coastal";

export const PALETTE_FAMILIES: { id: PaletteFamily; label: string; blurb: string }[] = [
    { id: "greens", label: "Greens & naturals", blurb: "The course itself: fairway, pine, sage and olive." },
    { id: "classic", label: "Classic club", blurb: "Blazer colours for private and historic clubs." },
    { id: "coastal", label: "Coastal & desert", blurb: "Water, sky, clay and canyon." },
];

export interface ClubPalette {
    id: string;
    name: string;
    family: PaletteFamily;
    /** The 600 step: solid buttons and selected states. White text on it must be AA (4.5:1). */
    anchor: string;
    blurb: string;
}

export const CLUB_PALETTES: ClubPalette[] = [
    { id: "fairway", name: "Fairway", family: "greens", anchor: "#2C7C4D", blurb: "Crane's own green. The default." },
    { id: "pine", name: "Pine", family: "greens", anchor: "#1E5E4A", blurb: "Deep forest green." },
    { id: "sage", name: "Sage", family: "greens", anchor: "#4F6B52", blurb: "Soft, muted green-grey." },
    { id: "olive", name: "Olive Grove", family: "greens", anchor: "#5B6420", blurb: "Warm olive." },
    { id: "navy", name: "Navy Blazer", family: "classic", anchor: "#1F3A68", blurb: "Classic club navy." },
    { id: "claret", name: "Claret", family: "classic", anchor: "#7A1F35", blurb: "Burgundy for heritage clubs." },
    { id: "charcoal", name: "Charcoal", family: "classic", anchor: "#3D4349", blurb: "Quiet near-black." },
    { id: "gold", name: "Club Gold", family: "classic", anchor: "#7C5A12", blurb: "Trophy gold, deep enough for white text." },
    { id: "harbor", name: "Harbor", family: "coastal", anchor: "#0F6670", blurb: "Teal of a harbour at dusk." },
    { id: "ocean", name: "Ocean", family: "coastal", anchor: "#1F5F9E", blurb: "Open-water blue." },
    { id: "terracotta", name: "Terracotta", family: "coastal", anchor: "#A1452A", blurb: "Sun-baked clay." },
    { id: "canyon", name: "Canyon", family: "coastal", anchor: "#7E4A35", blurb: "Desert rock and adobe." },
];

export const DEFAULT_PALETTE_ID = "fairway";
export const paletteById = (id: string | undefined): ClubPalette => CLUB_PALETTES.find((p) => p.id === id) ?? CLUB_PALETTES[0];

const RAMPS = new Map<string, Ramp>();
/** The generated 25–950 ramp for a palette (memoised). */
export const paletteRamp = (id: string): Ramp => {
    const p = paletteById(id);
    let r = RAMPS.get(p.id);
    if (!r) {
        r = rampFrom(p.anchor);
        RAMPS.set(p.id, r);
    }
    return r;
};

/** Inline style that sets a palette's brand ramp (`--color-brand-25` … `--color-brand-950`). */
export const paletteStyle = (id: string): Record<string, string> => {
    const r = paletteRamp(id);
    return Object.fromEntries(RAMP_STEPS.map((s) => [`--color-brand-${s}`, r[s]]));
};

/* ------------------------------------------------------------------ */
/* Contrast checks (shown in the palette gallery; enforced in a test)  */
/* ------------------------------------------------------------------ */

const WHITE = "#FFFFFF";
/** Dark-mode page background (neutral-950). */
const DARK_BG = "#0C0E12";

export interface PaletteCheck {
    label: string;
    /** Which appearance the pair is seen in. */
    mode: "light" | "dark";
    ratio: number;
    min: number;
    pass: boolean;
}

/** The pairs a palette must pass: button text, brand text on white, and brand marks on the dark page. */
export const paletteChecks = (id: string): PaletteCheck[] => {
    const r = paletteRamp(id);
    const c = (mode: PaletteCheck["mode"], label: string, a: string, b: string, min: number): PaletteCheck => {
        const ratio = Math.round(contrast(a, b) * 100) / 100;
        return { label, mode, ratio, min, pass: ratio >= min };
    };
    return [
        c("light", "White text on buttons (600)", WHITE, r[600], 4.5),
        c("light", "Brand text on white (700)", r[700], WHITE, 4.5),
        c("light", "Links and icons on white (600)", r[600], WHITE, 4.5),
        c("dark", "Brand icons on dark (500)", r[500], DARK_BG, 3),
        c("dark", "Brand borders on dark (400)", r[400], DARK_BG, 3),
    ];
};

export const palettePasses = (id: string) => paletteChecks(id).every((c) => c.pass);
