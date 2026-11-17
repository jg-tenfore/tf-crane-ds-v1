/**
 * MCG Instruction (Crane Web port of Fox Prototype 3). Routes are composed from three files, each
 * owned by one screen area:
 *   - `hub-routes.tsx`       /instruction, /instruction/instructors, /instruction/service/:id
 *   - `pro-book-routes.tsx`  /instruction/pro/:id, /instruction/instructors/:id, /instruction/book, /instruction/review
 *   - `packages-routes.tsx`  /instruction/packages, /instruction/credits
 * Data + URL model: `./data` (see data/index.ts). URL state hook: `useInstructionQuery()`.
 */
import { hubRoutes } from "./hub-routes";
import { packagesRoutes } from "./packages-routes";
import { proBookRoutes } from "./pro-book-routes";
import type { InstructionRoute } from "./route-types";

/** Every Instruction route, most specific first. Registered in `webRoutes()` (src/screens/web/web-app.tsx). */
export const instructionRoutes: InstructionRoute[] = [...proBookRoutes, ...packagesRoutes, ...hubRoutes];

export { hubRoutes, packagesRoutes, proBookRoutes, type InstructionRoute };
export { InstructionPlaceholderPage } from "./placeholder-page";
export { useInstructionQuery } from "./use-instruction-query";
