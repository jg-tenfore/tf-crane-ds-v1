import { InstructionHubPage, ServicePage } from "./hub";
import type { InstructionRoute } from "./route-types";

/**
 * Instruction hub routes (screens in `./hub/`).
 *
 * - `/instruction` — the one-step search: Services / Instructors tabs, format tiles + result sections,
 *   filters collapsed behind a "Filters" button unless `?expanded=1`. All state from the URL:
 *   `useInstructionQuery()` → `filterOfferings(queryToFilter(query))`.
 * - `/instruction/instructors` — the same hub on the Instructors tab (`view=instructors` implied).
 * - `/instruction/service/:id` — a private lesson (choose an instructor) or an Academy program /
 *   county clinic (schedule, capacity, Register / Join waitlist).
 */
export const hubRoutes: InstructionRoute[] = [
    { pattern: "/instruction/service/:id", label: "Service", render: (p) => <ServicePage key={p.id} id={p.id} /> },
    { pattern: "/instruction/instructors", label: "Instructors", render: () => <InstructionHubPage view="instructors" /> },
    { pattern: "/instruction", label: "Instruction", render: () => <InstructionHubPage /> },
];
