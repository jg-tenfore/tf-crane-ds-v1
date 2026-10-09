import type { RouteParams } from "@/components/prototype/stack-navigator";
import { StackNavigator } from "@/components/prototype/stack-navigator";
import { profileScreens } from "@/screens/profile";

/**
 * Opens a Profile sub-screen inside a real stack ([profile, route]) so its back
 * button works in the story and pops to the Profile root.
 */
export const ProfileStack = ({ route, params }: { route: string; params?: RouteParams }) => (
    <StackNavigator screens={profileScreens} initialRoute="profile" initialStack={route === "profile" ? ["profile"] : ["profile", { name: route, params }]} />
);
