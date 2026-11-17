/**
 * Everything an instructor page shows, in one call — identity (roster), what they teach and for
 * how much (catalog), their packs and monthly plan (packages), next opening (availability) and the
 * review summary (sample data — render `SAMPLE_REVIEW_NOTICE` with it).
 */
import { nextOpening } from "./availability";
import { clinicsForCoach, coachById, fromPrice, groupSizePrices, servicesForCoach, type Coach, type GroupSizePrice, type LessonService } from "./catalog";
import { packagesForCoach, subscriptionForCoach, type LessonPackage, type LessonSubscription } from "./packages";
import { instructorReviews, type InstructorReviewSummary } from "./reviews";
import { academyDisplayName, courseShortName } from "./roster";

export interface InstructorProfile {
    coach: Coach;
    /** "Mike Kenny, PGA". */
    displayName: string;
    /** Home courses as short names, in the roster's order. */
    courses: { id: string; name: string }[];
    /** Private lessons they teach, each with the 1…4 golfer price table for them. */
    rates: { service: LessonService; prices: GroupSizePrice[] }[];
    /** Scheduled programs they run. */
    programs: LessonService[];
    /** Lesson packs on sale for them. */
    packs: LessonPackage[];
    /** Their monthly plan, if any. */
    plan?: LessonSubscription;
    /** "Lessons from $X". */
    fromPrice: number;
    /** "9:30 AM · Falls Road" today, or "No openings today". */
    nextOpening: string;
    reviews: InstructorReviewSummary;
}

/** The profile for an instructor id, or undefined for an unknown id ("any" isn't a profile). */
export const instructorProfile = (id: string): InstructorProfile | undefined => {
    const coach = coachById(id);
    if (!coach || coach.isAny) return undefined;
    return {
        coach,
        displayName: academyDisplayName(coach),
        courses: coach.courseSlugs.map((slug) => ({ id: slug, name: courseShortName(slug) })),
        rates: servicesForCoach(id)
            .filter((s) => s.kind === "private")
            .map((service) => ({ service, prices: groupSizePrices(service, coach) })),
        programs: clinicsForCoach(id),
        packs: packagesForCoach(id),
        plan: subscriptionForCoach(id),
        fromPrice: fromPrice(id),
        nextOpening: coach.comingSoon ? "Not taking bookings yet" : nextOpening(id),
        reviews: instructorReviews(id),
    };
};
