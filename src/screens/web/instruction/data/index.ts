/**
 * MCG Instruction data — ported from Fox Prototype 3. Import from here:
 * `import { filterOfferings, instructionHref, COACHES } from "@/screens/web/instruction/data";`
 *
 * - `dates.ts`        — Crane's TODAY, ISO helpers, re-basing Fox's June dates (same weekday)
 * - `vocab.ts`        — formats, skill sets, instruction types, day chips
 * - `roster.ts`       — the Academy's instructors (identity only; generic contact)
 * - `catalog.ts`      — coaches, the service menu (privates + Academy programs), pricing, extras, promos
 * - `county-clinics.ts` — the county clinic program (+ P3 sample formats)
 * - `offerings.ts`    — one shelf over all three + the hub filter
 * - `availability.ts` — the time board (per-coach days, any-instructor board, guardrails, dayparts)
 * - `packages.ts`     — packs, credits, volume discount, monthly plans
 * - `reviews.ts`      — sample verified reviews (always show SAMPLE_REVIEW_NOTICE)
 * - `registration-rules.ts` — age / gender / questions / multi-buy
 * - `profile.ts`      — everything an instructor page needs, in one call
 * - `query.ts`        — the URL model + canonical hrefs for every Instruction state
 * - `images.ts`       — headshots, Academy lockup/banner/photos, program art
 * - `default-art.ts`  — TenFore's default photo sets (the fallback when a course has no photos)
 */
export * from "./availability";
export * from "./catalog";
export * from "./county-clinics";
export * from "./dates";
export * from "./default-art";
export * from "./images";
export * from "./offerings";
export * from "./packages";
export * from "./profile";
export * from "./query";
export * from "./registration-rules";
export * from "./reviews";
export * from "./roster";
export * from "./vocab";
