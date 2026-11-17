/**
 * Packages & credits (Crane Web port of Fox Prototype 3 › Flow B). Routes: `../packages-routes.tsx`.
 *
 * Reusable on other Instruction screens (e.g. the instructor profile):
 *   - `PackCard`          one pack as a link to its detail (`variant="compact"` on a coach's page)
 *   - `MonthlyPlanCard`   one monthly plan (concept), `hideCoach` on a coach's page
 *   - `CreditsExplainer`  "How lesson credits work" — buy → wallet → redeem (`compact` stacks it)
 *   - `CreditBalanceCard` one wallet balance with dots, value, history
 *   - `packHref(id, step?)`, `plansHref()`, `packSaving(pack)`, `planSaving(plan)`
 */
export { PackCard, packHref, packSaving, type PackCardProps } from "./pack-card";
export { MonthlyPlanCard, planSaving, type MonthlyPlanCardProps } from "./monthly-plan-card";
export { CreditsExplainer } from "./credits-explainer";
export { CreditBalanceCard, balanceStatus, isUsable, type BalanceStatus } from "./credit-balance-card";
export { CoachAvatar, CourseChip, CreditDots } from "./packages-ui";
export { PackagesPage, MonthlyPlansPage, plansHref, LESSONS_PARAM } from "./packages-page";
export { PackDetailPage, PlanDetailPage, RENEW_PARAM } from "./pack-detail-page";
export { PackCheckoutPage, PackPurchasedPage, BOUGHT_PARAM, type Purchase } from "./pack-checkout-page";
export { CreditsPage, DEMO_PARAM, type CreditsDemo } from "./credits-page";
