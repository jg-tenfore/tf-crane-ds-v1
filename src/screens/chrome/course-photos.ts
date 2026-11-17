/**
 * Course hero photos (≈1200px WebP copies of the originals in `images/courses/`), imported as Vite
 * assets so the URLs resolve in Storybook, both prototypes and the Pages build. Wired to sample
 * courses via `Course.photo` in `src/data/crane.ts`; shown by `CourseInfoSheet`.
 */
import fallsRoad from "./images/course-photos/falls-road.webp";
import flogolf from "./images/course-photos/flogolf-lounge.webp";
import hampshireGreens from "./images/course-photos/hampshire-greens.webp";
import kettleHills from "./images/course-photos/kettle-hills.webp";
import laytonsville from "./images/course-photos/laytonsville.webp";
import littleBennett from "./images/course-photos/little-bennett.webp";
import memorialPark from "./images/course-photos/memorial-park.webp";
import northwest from "./images/course-photos/northwest.webp";

export const coursePhotos = { fallsRoad, flogolf, hampshireGreens, kettleHills, laytonsville, littleBennett, memorialPark, northwest };
