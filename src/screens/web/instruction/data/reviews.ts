/**
 * Instructor reviews — **Tenfore verified post-lesson reviews**, with sample content.
 * Ported verbatim from Fox Prototype 3 (`mcg-3/academy/instructor-reviews.ts`); only the
 * review link changed (it now comes from `query.ts`).
 *
 * ## Where reviews come from
 *
 * Not Google, and not an open comment box. After a lesson booked through Tenfore is
 * marked complete, the golfer who took it gets one short prompt (email + account
 * activity) to rate it. Only that golfer, only for that lesson, only once. That is what
 * "verified" means on the page: every review is tied to a real completed booking.
 *
 * ## The three rules the Academy controls
 *
 *  1. **Optional per instructor.** An instructor (or the Academy on their behalf) can
 *     turn reviews off. Off means no rating, no count and no reviews block on the
 *     profile — not an empty one. Prompts aren't sent for their lessons either.
 *  2. **A minimum before anything shows.** No rating is published until an instructor
 *     has `REVIEW_MINIMUM` verified reviews. Below that the profile says reviews are
 *     being collected, so one bad afternoon can't define a pro who just joined, and a
 *     handful of reviews can't be traced back to the golfers who wrote them.
 *  3. **Moderated before publishing.** Staff can hold a review that names another
 *     golfer or isn't about the lesson. Held reviews still count toward the rating.
 *
 * ## The content is still sample data
 *
 * The roster is real, named Montgomery County employees and none of this is real
 * feedback about any of them. The copy stays about the *lesson experience* (booking,
 * setup, pacing, notes), authors are initials only, and the averages are deterministic
 * and pinned to 4.5–5.0. Any screen that renders it must show `SAMPLE_REVIEW_NOTICE`.
 */

/** The standing disclaimer. The profile renders this in the reviews header, undismissable. */
export const SAMPLE_REVIEW_NOTICE = "Sample review data — illustrative only, not real student feedback.";

/** The shorter form, for the inline rating control in the booking box. */
export const SAMPLE_REVIEW_NOTICE_SHORT = "Sample data";

/** Verified reviews an instructor needs before a rating is published. */
export const REVIEW_MINIMUM = 5;

/** The one-line answer to "where do these come from?", shown wherever a rating is. */
export const REVIEW_SOURCE =
    "Verified reviews from golfers who completed a lesson booked through MCG. Tenfore asks for one after every lesson — they aren't pulled from Google.";

/** The completed booking a review is written against. */
export interface LessonReviewTarget {
    coachId: string;
    serviceId: string;
    courseSlug?: string;
    /** Display date of the completed lesson, e.g. "Tue, Aug 18". */
    dateLabel?: string;
}


export interface InstructorReview {
    id: string;
    /** Two initials. Never a name. */
    initials: string;
    /** Display date, fixed so a build never shifts it. */
    date: string;
    stars: number;
    title: string;
    text: string;
    /** The completed booking this review is attached to. */
    lesson: string;
    courseSlug?: string;
}

/**
 * - `off` — the instructor turned reviews off. Render nothing.
 * - `collecting` — on, but fewer than `REVIEW_MINIMUM` verified reviews. No rating yet.
 * - `published` — on, and over the minimum. Rating, bars and cards.
 */
export type ReviewStatus = "off" | "collecting" | "published";

export interface InstructorReviewSummary {
    status: ReviewStatus;
    /** Verified reviews received. Meaningful for `collecting` and `published`. */
    count: number;
    /** Only when `published`. Always within 4.5–5.0. */
    average: number;
    /** Fractions for the 5★ → 1★ bars; sums to 1. Only when `published`. */
    distribution: number[];
    /** Only when `published` — nothing is shown while collecting. */
    reviews: InstructorReview[];
}

/* ------------------------------------------------------------------ */
/* Per-instructor settings                                             */
/* ------------------------------------------------------------------ */

/**
 * Instructors with reviews switched off. Sample settings to demonstrate the state —
 * not a statement about any real instructor's preference.
 */
const REVIEWS_OFF = new Set(["john-ross", "terry-charlton"]);

/**
 * Instructors still under the minimum, with how many verified reviews they have.
 * Again sample settings, chosen to demonstrate the state.
 */
const COLLECTING: Record<string, number> = {
    "blessing-jasi": 2,
    "brandon-jarvis": 3,
    "dave-degirolamo": 4,
};

/* ------------------------------------------------------------------ */
/* Copy pool                                                           */
/* ------------------------------------------------------------------ */

/**
 * Every entry is about the *booking and lesson-day experience*, phrased so it would
 * read the same about any instructor at any of the nine courses.
 */
const POOL: { title: string; text: string }[] = [
    { title: "Booking took a minute", text: "Picked a time online, got the confirmation straight away, and the bay was ready when I arrived." },
    { title: "Good use of the hour", text: "Warm-up, work, then a few swings to finish. The session was paced so nothing felt rushed at the end." },
    { title: "Clear notes afterwards", text: "Left with two drills written down and a short list of what to practise before the next session." },
    { title: "Plenty of range time", text: "Balls were waiting at the bay and there was never a wait between swings. Easy morning." },
    { title: "Easy to reschedule", text: "Weather moved my slot and the change went through the same day with no fuss at all." },
    { title: "Well organised", text: "Check-in at the shop was quick, the lesson tee was set up, and everything started on time." },
    { title: "Straightforward from start to finish", text: "Turned up, worked on one thing, and understood what to do next. That's what I wanted from it." },
    { title: "Worth the drive", text: "Slot times suited a weekday evening and the facility was quiet enough to actually concentrate." },
    { title: "Good value for the time", text: "The price is clear up front and the full session is spent hitting balls rather than talking about them." },
    { title: "Sensible pacing", text: "One change per session instead of five. Came away with something I could repeat on my own." },
    { title: "Simple to book for two", text: "Booked a two-golfer slot and both of us got enough swings. Split price was shown before paying." },
    { title: "Nice setup", text: "Video on the bay and the clip was sent over afterwards, which made the notes easier to follow." },
];

const LESSONS = ["45-Minute Private", "60-Minute Private", "30-Minute Tune-Up", "45-Minute Private", "9-Hole Playing Lesson"];

const INITIALS = ["JM", "RT", "AP", "KD", "LS", "MB", "CW", "DN", "SH", "TO", "EG", "PV"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August"];

/* ------------------------------------------------------------------ */
/* Derivation                                                          */
/* ------------------------------------------------------------------ */

/** Stable FNV-1a over the instructor id, so nothing here shifts between builds. */
const hash = (s: string): number => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
};

/**
 * Bar fractions by average, tenth by tenth. Hand-written rather than solved for, so the
 * shape stays believable (a long 5★ bar, a short tail) at every point in the band.
 */
const DISTRIBUTIONS: Record<string, number[]> = {
    "4.5": [0.62, 0.28, 0.06, 0.025, 0.015],
    "4.6": [0.68, 0.24, 0.05, 0.02, 0.01],
    "4.7": [0.74, 0.2, 0.04, 0.015, 0.005],
    "4.8": [0.82, 0.14, 0.03, 0.007, 0.003],
    "4.9": [0.9, 0.08, 0.015, 0.004, 0.001],
    "5.0": [0.96, 0.04, 0, 0, 0],
};

/** Whether reviews are switched on for this instructor. */
export const reviewsEnabled = (instructorId: string): boolean => !REVIEWS_OFF.has(instructorId);

/**
 * The review block for one instructor.
 *
 * Deterministic in every field: status, the average, the count, which lines from the
 * pool are used and in what order, and the initials and dates attached to them all
 * come from the id. Nothing is random and nothing is dated relative to "now".
 */
export const instructorReviews = (instructorId: string): InstructorReviewSummary => {
    if (!reviewsEnabled(instructorId)) {
        return { status: "off", count: 0, average: 0, distribution: [], reviews: [] };
    }

    const collecting = COLLECTING[instructorId];
    if (collecting !== undefined && collecting < REVIEW_MINIMUM) {
        return { status: "collecting", count: collecting, average: 0, distribution: [], reviews: [] };
    }

    const h = hash(instructorId);

    // 4.5 … 5.0 inclusive, one decimal place.
    const average = Math.round((4.5 + (h % 6) / 10) * 10) / 10;
    const count = 24 + (h % 71);

    const offset = h % POOL.length;
    const reviews: InstructorReview[] = Array.from({ length: 6 }, (_, i) => {
        const entry = POOL[(offset + i * 5) % POOL.length];
        // A 4★ every third card keeps the bars and the cards telling the same story.
        const stars = average >= 4.9 ? 5 : i % 3 === 2 ? 4 : 5;
        return {
            id: `${instructorId}--sample-${i}`,
            initials: INITIALS[(offset + i * 3) % INITIALS.length],
            date: `${MONTHS[(offset + i * 2) % MONTHS.length]} 2026`,
            stars,
            title: entry.title,
            text: entry.text,
            lesson: LESSONS[(offset + i) % LESSONS.length],
        };
    });

    return {
        status: "published",
        average,
        count,
        distribution: DISTRIBUTIONS[average.toFixed(1)] ?? DISTRIBUTIONS["4.7"],
        reviews,
    };
};
