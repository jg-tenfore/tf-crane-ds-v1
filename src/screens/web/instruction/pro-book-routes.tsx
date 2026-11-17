import { BookPage } from "./book/book-page";
import { LessonReviewPage } from "./book/review-page";
import { InstructorProfilePage } from "./pro/instructor-profile-page";
import type { InstructionRoute } from "./route-types";

/**
 * Instructor profile + booking routes (Fox Prototype 3 → Crane Web).
 *
 * - `/instruction/pro/:id` — the instructor profile (`InstructorProfilePage`): gallery + buy box,
 *   private lessons with group-size prices, the programs they run, next openings, packs and plans,
 *   sample reviews. Keeps the hub's query for "All instructors".
 * - `/instruction/instructors/:id` — same profile (Fox's Academy-style URL).
 * - `/instruction/book` — `?coach=&service=&course=` + `date`, `time`, `players`, `step`
 *   (`time · details · account · payment · confirm · waitlist`; programs: `sessions · details · …`),
 *   `extras`, `pay`, `promo`, `sessions`. See `book/book-model.ts` for the full URL contract.
 * - `/instruction/review` — `step=booked|waitlisted|registered&confirmation=…` (confirmation), or
 *   `?coach=&service=&course=&date=` alone: rate a completed lesson.
 */
export const proBookRoutes: InstructionRoute[] = [
    {
        pattern: "/instruction/pro/:id",
        label: "Instructor profile",
        render: (p) => <InstructorProfilePage id={p.id} />,
    },
    {
        pattern: "/instruction/instructors/:id",
        label: "Instructor profile (Academy URL)",
        render: (p) => <InstructorProfilePage id={p.id} />,
    },
    {
        pattern: "/instruction/book",
        label: "Book a lesson",
        render: () => <BookPage />,
    },
    {
        pattern: "/instruction/review",
        label: "Booking confirmation / review a lesson",
        render: () => <LessonReviewPage />,
    },
];
