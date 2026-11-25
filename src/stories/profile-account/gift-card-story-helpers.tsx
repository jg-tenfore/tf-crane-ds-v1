import type { RouteParams } from "@/components/prototype/stack-navigator";
import { StackNavigator } from "@/components/prototype/stack-navigator";
import { GiftCardsProvider, profileScreens } from "@/screens/profile";

/**
 * Opens a gift card screen inside a real stack ([profile, gift-cards, route]) with its own wallet,
 * so Back returns to Gift Cards and paying adds the New card / sent gift there.
 */
export const GiftCardStack = ({ route, params }: { route: string; params?: RouteParams }) => (
    <GiftCardsProvider>
        <StackNavigator screens={profileScreens} initialRoute="profile" initialStack={["profile", "gift-cards", { name: route, params }]} />
    </GiftCardsProvider>
);
