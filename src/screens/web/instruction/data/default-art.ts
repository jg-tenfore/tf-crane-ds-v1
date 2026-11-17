/**
 * Default photo sets: TenFore's generic imagery for courses that haven't uploaded their own.
 *
 * Decided on the Nov 17 call (Weston, Jared): courses often won't upload photos, so TenFore ships
 * six default sets, each covering the five Instruction categories. An organization picks one in
 * Buck's clinic template builder and can override any photo per course. There's no TenFore-logo
 * fallback. MCG has its own photos, so it only shows a set when asked (`?photos=<set>` demo, or
 * `photos.own: false` on the org).
 *
 * Files: `../images/default-art/<set>/<category>.webp` (1200 wide, 3:2, no logos or text, people
 * from behind or at a distance). They're imported as Vite assets, so the URLs work on Pages too.
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

export const isDefaultPhotoSet = (id: string | undefined): id is DefaultPhotoSetId => DEFAULT_PHOTO_SETS.some((s) => s.id === id);

/** File name for each Instruction category. */
const CATEGORY_FILE: Record<OfferingFormat, string> = {
    private: "private-lesson",
    clinic: "group-clinic",
    "junior-camp": "junior-camp",
    "junior-league": "junior-league",
    op36: "op-36",
};

/** The default photo for a category in a set. */
export const defaultArt = (set: DefaultPhotoSetId, format: OfferingFormat): string => ART[`../images/default-art/${set}/${CATEGORY_FILE[format]}.webp`];
