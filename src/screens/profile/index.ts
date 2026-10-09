import { createElement } from "react";
import type { ScreenRegistry } from "@/components/prototype/stack-navigator";
import { AccountBalanceScreen, type AccountBalanceScreenProps } from "./account-balance-screen";
import { AddPaymentMethodScreen, type AddPaymentMethodScreenProps } from "./add-payment-method-screen";
import { AppearanceScreen } from "./appearance-screen";
import { CommunityScreen, type CommunityScreenProps } from "./community-screen";
import { EditProfileScreen } from "./edit-profile-screen";
import { GiftCardsScreen } from "./gift-cards-screen";
import { GolfBuddiesScreen, type GolfBuddiesScreenProps } from "./golf-buddies-screen";
import { KioskSignInScreen } from "./kiosk-sign-in-screen";
import { MembershipsScreen } from "./memberships-screen";
import { PaymentMethodsScreen } from "./payment-methods-screen";
import { ProfileScreen } from "./profile-screen";
import { PunchCardsScreen } from "./punch-cards-screen";
import { RainChecksScreen } from "./rain-checks-screen";
import { WaitlistScreen } from "./waitlist-screen";

export * from "./account-balance-screen";
export * from "./add-payment-method-screen";
export * from "./appearance-screen";
export * from "./community-screen";
export * from "./edit-profile-screen";
export * from "./gift-cards-screen";
export * from "./golf-buddies-screen";
export * from "./kiosk-sign-in-screen";
export * from "./memberships-screen";
export * from "./payment-methods-screen";
export * from "./profile-screen";
export * from "./punch-cards-screen";
export * from "./rain-checks-screen";
export * from "./waitlist-screen";
export { ProfileNav, ProfileRow, RowCard } from "./profile-shared";

/**
 * Profile tab routes. Root is "profile"; every row on it pushes one of the others.
 * Route params are forwarded as props where a screen takes any.
 */
export const profileScreens: ScreenRegistry = {
    profile: () => createElement(ProfileScreen),
    "edit-profile": () => createElement(EditProfileScreen),
    "account-balance": (p) => createElement(AccountBalanceScreen, p as AccountBalanceScreenProps),
    "payment-methods": () => createElement(PaymentMethodsScreen),
    "add-payment-method": (p) => createElement(AddPaymentMethodScreen, p as AddPaymentMethodScreenProps),
    "golf-buddies": (p) => createElement(GolfBuddiesScreen, p as GolfBuddiesScreenProps),
    memberships: () => createElement(MembershipsScreen),
    waitlist: () => createElement(WaitlistScreen),
    "punch-cards": () => createElement(PunchCardsScreen),
    "rain-checks": () => createElement(RainChecksScreen),
    "gift-cards": () => createElement(GiftCardsScreen),
    appearance: () => createElement(AppearanceScreen),
    community: (p) => createElement(CommunityScreen, p as CommunityScreenProps),
    "kiosk-sign-in": () => createElement(KioskSignInScreen),
};
