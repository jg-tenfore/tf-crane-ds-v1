import { createElement, type ReactNode } from "react";
import { MyRoundsPage } from "./my-rounds-page";
import { TeeTimeCheckoutPage } from "./tee-time-checkout-page";
import { TeeTimeConfirmationPage } from "./tee-time-confirmation-page";
import { TeeTimesPage } from "./tee-times-page";

export { MyRoundsPage, type MyRoundsPageProps } from "./my-rounds-page";
export { TeeTimeCheckoutPage, type TeeTimeCheckoutPageProps } from "./tee-time-checkout-page";
export { TeeTimeConfirmationPage, type TeeTimeConfirmationPageProps } from "./tee-time-confirmation-page";
export { TeeTimesPage, type TeeTimesPageProps } from "./tee-times-page";
export { TeeTimeRoundsProvider, useTeeTimeRounds } from "./tee-time-rounds-store";

export interface TeeTimeRoute {
    /** matchPath() pattern. Query strings (?d=, ?t=, ?p=) are read inside the page. */
    pattern: string;
    render: (params: Record<string, string>) => ReactNode;
}

/**
 * Crane Web tee-time routes. Every page includes WebShell active="tee-times".
 *   /tee-times?d=&p=  → /tee-times/checkout?d=&t=&p=  → /tee-times/confirmation/:id?d=&t=&h=&tr=&g=
 *   /tee-times/my-rounds(/past) → confirmation (manage / cancel) or back to /tee-times
 * Wrap the flow in <TeeTimeRoundsProvider> so reserved rounds appear in My Rounds.
 */
export const teeTimeRoutes: TeeTimeRoute[] = [
    { pattern: "/tee-times", render: () => createElement(TeeTimesPage) },
    { pattern: "/tee-times/checkout", render: () => createElement(TeeTimeCheckoutPage) },
    { pattern: "/tee-times/confirmation/:id", render: (p) => createElement(TeeTimeConfirmationPage, { id: p.id }) },
    { pattern: "/tee-times/my-rounds/:tab?", render: (p) => createElement(MyRoundsPage, { tab: p.tab === "past" ? "past" : "upcoming" }) },
];
