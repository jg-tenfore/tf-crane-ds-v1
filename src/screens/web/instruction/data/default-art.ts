/**
 * Default photo sets: TenFore's generic imagery for courses that haven't uploaded their own.
 *
 * Decided on the Nov 17 call (Weston, Jared): courses often won't upload photos, so TenFore ships
 * six default sets, each covering the five Instruction categories. An organization picks one in
 * Buck's clinic template builder (until then: TENFORE_DEFAULT_SET, Overcast classic) and can
 * override any photo per course. There's no TenFore-logo
 * fallback. MCG has its own photos, so it only shows a set when asked (`?photos=<set>` demo, or
 * `photos.own: false` on the org).
 *
 * Files: `../images/default-art/<set>/<category>.webp`, `<category>-2.webp` and `<category>-3.webp`:
 * three photos per category (1200 wide, 3:2, no logos or text), so cards in a list don't repeat. Buck's
 * picker uses the same set ids and the same three-photo arrays. Imported as Vite assets, so the URLs
 * work on Pages too.
 */
import type { OfferingFormat } from "./vocab";

const ART = import.meta.glob<string>("../images/default-art/*/*.webp", { eager: true, import: "default" });

export const DEFAULT_PHOTO_SETS = [
    { id: "morning-parkland", label: "Morning parkland", blurb: "Low sun through tall trees" },
    { id: "bright-range", label: "Bright range", blurb: "Covered bays under a blue sky" },
    { id: "evening-links", label: "Evening links", blurb: "Dunes and long grass at sunset" },
    { id: "overcast-classic", label: "Overcast classic", blurb: "Old oaks, soft light" },
    { id: "indoor-studio", label: "Indoor studio", blurb: "Simulator bays and putting turf" },
    { id: "autumn", label: "Autumn", blurb: "Fall colour on the course" },
] as const;

export type DefaultPhotoSetId = (typeof DEFAULT_PHOTO_SETS)[number]["id"];

/**
 * The TenFore-wide default: the set a course gets until it picks its own (Justin's pick, Nov 17).
 * Buck uses the same constant name (`TENFORE_DEFAULT_SET`).
 */
export const TENFORE_DEFAULT_SET: DefaultPhotoSetId = "overcast-classic";

export const isDefaultPhotoSet = (id: string | undefined): id is DefaultPhotoSetId => DEFAULT_PHOTO_SETS.some((s) => s.id === id);

/** File name for each Instruction category. */
const CATEGORY_FILE: Record<OfferingFormat, string> = {
    private: "private-lesson",
    clinic: "group-clinic",
    "junior-camp": "junior-camp",
    "junior-league": "junior-league",
    op36: "op-36",
};

/** The three photos for a category in a set, in order (the first is the set's "hero" for that category). */
export const defaultArtList = (set: DefaultPhotoSetId, format: OfferingFormat): string[] =>
    ["", "-2", "-3"].map((suffix) => ART[`../images/default-art/${set}/${CATEGORY_FILE[format]}${suffix}.webp`]).filter(Boolean);

/** A stable 0..n-1 pick for a key (an offering id), so a card keeps its photo across renders. */
const pick = (key: string, n: number) => {
    let h = 0;
    for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h % n;
};

/**
 * The default photo for a category in a set.
 * - A number (the card's position in its list) rotates 1-2-3-1-2-3, so neighbouring cards never match
 *   (decided Nov 17). Lists pass this.
 * - A string (an offering or program id) picks one stably for that id: detail banners and thumbnails.
 * - Nothing: the first photo (category tiles).
 */
export const defaultArt = (set: DefaultPhotoSetId, format: OfferingFormat, key?: string | number): string => {
    const list = defaultArtList(set, format);
    if (typeof key === "number") return list[key % list.length];
    return key ? list[pick(key, list.length)] : list[0];
};
