import type { ComponentType } from "react";
import { AccountActivityScreen } from "./account-activity-screen";
import { AccountBuddiesScreen } from "./account-buddies-screen";
import { AccountEventsScreen } from "./account-events-screen";
import { AccountMembershipsScreen } from "./account-memberships-screen";
import { AccountMyAccountScreen } from "./account-my-account-screen";
import { AccountOverviewScreen } from "./account-overview-screen";
import { AccountWalletScreen } from "./account-wallet-screen";

export { AccountActivityScreen, AccountBuddiesScreen, AccountEventsScreen, AccountMembershipsScreen, AccountMyAccountScreen, AccountOverviewScreen, AccountWalletScreen };
export type { AccountBuddiesScreenProps } from "./account-buddies-screen";
export type { AccountEventsScreenProps } from "./account-events-screen";
export type { AccountMembershipsScreenProps } from "./account-memberships-screen";
export type { AccountMyAccountScreenProps } from "./account-my-account-screen";
export type { AccountOverviewScreenProps } from "./account-overview-screen";
export type { AccountWalletScreenProps } from "./account-wallet-screen";
export { ACCOUNT_NAV, AccountLayout, MEMBERSHIPS_NAV, useSignOut, type AccountSection } from "./account-layout";

export interface AccountRoute {
    /** For `matchPath` from web-router. Query strings (?tab=, ?open=) are read by the screen itself. */
    pattern: string;
    title: string;
    screen: ComponentType;
}

/**
 * Crane Web › Profile ∕ Account routes, most specific first. Deep links handled inside a screen:
 * /account/activity?tab=past|purchases, /account/activity/orders/:order (receipt dialog),
 * /account/events?open=:eventId (event dialog).
 */
export const accountRoutes: AccountRoute[] = [
    { pattern: "/account", title: "Overview", screen: AccountOverviewScreen },
    { pattern: "/account/my-account", title: "My Account", screen: AccountMyAccountScreen },
    { pattern: "/account/activity/:view?/:order?", title: "Activity", screen: AccountActivityScreen },
    { pattern: "/account/wallet", title: "Wallet", screen: AccountWalletScreen },
    { pattern: "/account/buddies", title: "Golf Buddies", screen: AccountBuddiesScreen },
    { pattern: "/account/events", title: "Events", screen: AccountEventsScreen },
    { pattern: "/account/memberships", title: "Memberships", screen: AccountMembershipsScreen },
];
