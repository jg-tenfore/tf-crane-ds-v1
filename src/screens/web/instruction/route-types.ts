import type { WebRoute } from "../web-app";

/** A Crane Web route with a human label (screen indexes, the prototype jump list). */
export type InstructionRoute = WebRoute & { label: string };
