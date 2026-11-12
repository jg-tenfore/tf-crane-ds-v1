/**
 * Real club logos for the TenFore courses we have artwork for. Any course whose id or name
 * matches one of these gets its logo instead of the initials placeholder in `CourseLogo`
 * (and anywhere else a course mark is shown). Every other course keeps the initials tile.
 *
 * The files are 256px WebP copies of the originals in `images/courses/` (Sagamore, MCG + each
 * MCG course, FloGolf, Kettle Hills). They're imported as Vite assets so the URLs are right in
 * Storybook, both prototypes and the GitHub Pages build (base path) without a static dir.
 */
import crossvines from "./images/course-logos/crossvines.webp";
import fallsRoad from "./images/course-logos/falls-road.webp";
import flogolf from "./images/course-logos/flogolf.webp";
import hampshireGreens from "./images/course-logos/hampshire-greens.webp";
import kettleHills from "./images/course-logos/kettle-hills.webp";
import laytonsville from "./images/course-logos/laytonsville.webp";
import littleBennett from "./images/course-logos/little-bennett.webp";
import mcg from "./images/course-logos/mcg.webp";
import needwood from "./images/course-logos/needwood.webp";
import northwest from "./images/course-logos/northwest.webp";
import rattlewood from "./images/course-logos/rattlewood.webp";
import sagamore from "./images/course-logos/sagamore.webp";
import sligoCreek from "./images/course-logos/sligo-creek.webp";

export interface CourseBrand {
    id: string;
    /** Who the logo belongs to (used for alt text and docs). */
    label: string;
    /** Image URL (Vite asset). */
    logo: string;
    /**
     * How the art sits in its tile: `cover` for full-bleed square marks with their own
     * background (FloGolf, Kettle Hills); `contain` for marks on white / transparent.
     */
    fit: "cover" | "contain";
    /** Inset for `contain` marks, as a fraction of the tile (0–0.5). */
    inset?: number;
}

const brand = (b: CourseBrand) => b;

/** MCG course logos sit on transparent backgrounds with a wordmark underneath: give them air. */
const MCG_INSET = 0.1;

/** First match wins, so the specific MCG courses come before the MCG-wide mark. */
const COURSE_BRANDS: { match: RegExp; brand: CourseBrand }[] = [
    { match: /sagamore/i, brand: brand({ id: "sagamore", label: "Sagamore Golf", logo: sagamore, fit: "contain" }) },
    { match: /laytonsville/i, brand: brand({ id: "laytonsville", label: "Laytonsville Golf Course", logo: laytonsville, fit: "contain", inset: MCG_INSET }) },
    { match: /\bnorthwest\b/i, brand: brand({ id: "northwest", label: "Northwest Golf Course", logo: northwest, fit: "contain", inset: MCG_INSET }) },
    { match: /needwood/i, brand: brand({ id: "needwood", label: "Needwood Golf Course", logo: needwood, fit: "contain", inset: MCG_INSET }) },
    { match: /little[\s-]?bennett/i, brand: brand({ id: "little-bennett", label: "Little Bennett Golf Course", logo: littleBennett, fit: "contain", inset: MCG_INSET }) },
    { match: /falls[\s-]?road/i, brand: brand({ id: "falls-road", label: "Falls Road Golf Course", logo: fallsRoad, fit: "contain", inset: MCG_INSET }) },
    { match: /hampshire[\s-]?greens/i, brand: brand({ id: "hampshire-greens", label: "Hampshire Greens Golf Course", logo: hampshireGreens, fit: "contain", inset: MCG_INSET }) },
    { match: /sligo[\s-]?creek/i, brand: brand({ id: "sligo-creek", label: "Sligo Creek Golf Course", logo: sligoCreek, fit: "contain", inset: 0.04 }) },
    { match: /rattlewood/i, brand: brand({ id: "rattlewood", label: "Rattlewood Golf Course", logo: rattlewood, fit: "contain", inset: 0.04 }) },
    { match: /crossvines/i, brand: brand({ id: "crossvines", label: "The Crossvines", logo: crossvines, fit: "contain", inset: 0.06 }) },
    { match: /\bmcg\b|montgomery county golf/i, brand: brand({ id: "mcg", label: "Montgomery County Golf", logo: mcg, fit: "contain", inset: 0.04 }) },
    { match: /flo[\s-]?golf/i, brand: brand({ id: "flogolf", label: "FloGolf", logo: flogolf, fit: "cover" }) },
    { match: /kettle[\s-]?hills/i, brand: brand({ id: "kettle-hills", label: "Kettle Hills Golf Course", logo: kettleHills, fit: "cover" }) },
];

/** Every brand we have a logo for (stories / docs). */
export const ALL_COURSE_BRANDS: CourseBrand[] = COURSE_BRANDS.map((b) => b.brand);

/**
 * The real logo for a course (by id, then name), or `undefined` for courses that should keep
 * the initials placeholder. Accepts a Course-like object or a bare name string
 * ("Sagamore Spring", "MCG", "FloGolf Indoor", …).
 */
export const courseBrandFor = (course: { id?: string; name?: string; shortName?: string } | string | undefined): CourseBrand | undefined => {
    if (!course) return undefined;
    const haystack = typeof course === "string" ? course : [course.id, course.name, course.shortName].filter(Boolean).join(" ");
    return COURSE_BRANDS.find((b) => b.match.test(haystack))?.brand;
};

/** True when `courseBrandFor` has a real logo for this course. */
export const hasCourseBrand = (course: Parameters<typeof courseBrandFor>[0]) => courseBrandFor(course) != null;
