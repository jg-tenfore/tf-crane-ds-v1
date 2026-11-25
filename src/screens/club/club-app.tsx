import { createElement, useMemo, useState, type ReactNode } from "react";
import { UNSAFE_PortalProvider } from "react-aria";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";
import { StackNavigator, type Route, type ScreenRegistry } from "@/components/prototype/stack-navigator";
import type { ClubProfile } from "@/data/club-profiles";
import { CourseInfoSheet, CourseProvider, LocationsDrawer } from "@/screens/chrome";
import { ClubFeedScreen } from "./club-feed-screen";
import { CLUB_ROUTES, ClubHomeScreen, type ClubHomeScreenProps } from "./club-home-screen";

/**
 * Sends overlays (sheets, drawers) into a box inside the club's <ClubTheme>, so they take its palette.
 * IPhoneFrame portals into the phone screen, which in a `phone: true` story sits *outside* a ClubTheme
 * wrapped around the story (ClubTheme is `display: contents` and can't wrap the portal target).
 */
export const ClubPortalScope = ({ children }: { children: ReactNode }) => {
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    return (
        <div ref={setNode} className="absolute inset-0" data-club-portal-scope>
            {node && <UNSAFE_PortalProvider getContainer={() => node}>{children}</UNSAFE_PortalProvider>}
        </div>
    );
};

/** Screen options shared by every screen in the club stack. */
export type ClubScreenOptions = Omit<ClubHomeScreenProps, "profile"> & { profile?: ClubProfile };

/**
 * The club stack: "club-home" (root) and "club-feed" (News & updates, optional `postId` param).
 * Without a profile, both screens use the profile for the current course.
 */
export const clubScreens = ({ profile, ...home }: ClubScreenOptions = {}): ScreenRegistry => ({
    [CLUB_ROUTES.home]: () => createElement(ClubHomeScreen, { profile, ...home }),
    [CLUB_ROUTES.feed]: (params) => createElement(ClubFeedScreen, { profile, focusPostId: params.postId as string | undefined }),
});

export interface ClubAppProps extends ClubScreenOptions {
    profile: ClubProfile;
    /** Open on a deeper screen, e.g. `["club-home", "club-feed"]`. */
    initialStack?: (string | Route)[];
    /** Fires with the top route's name after every push / pop. */
    onRouteChange?: (route: string) => void;
}

/**
 * ClubApp: the Home tab of a white-label app with everything it needs and nothing from outside:
 * course state (scoped to the profile's course), the club stack (home → feed), the floating tab bar, and
 * the My locations drawer and course info sheet. Wrap it in <ClubTheme> (and an IPhoneFrame).
 */
export const ClubApp = ({ profile, initialStack, onRouteChange, ...options }: ClubAppProps) => {
    const { heroPhoto, heroFocus, heroWidth, photoSet, animateFallback, openTeeTimeIndex, bookingStep, cartCount } = options;
    const screens = useMemo(
        () => clubScreens({ profile, heroPhoto, heroFocus, heroWidth, photoSet, animateFallback, openTeeTimeIndex, bookingStep, cartCount }),
        [profile, heroPhoto, heroFocus, heroWidth, photoSet, animateFallback, openTeeTimeIndex, bookingStep, cartCount],
    );
    return (
        <CourseProvider initialCourseId={profile.courseId}>
            <ClubPortalScope>
                <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
                    <StackNavigator
                        screens={screens}
                        initialRoute={CLUB_ROUTES.home}
                        initialStack={initialStack}
                        onStackChange={(s) => onRouteChange?.(s[s.length - 1].name)}
                    />
                    <TabBar items={CRANE_TABS} activeId="home" onChange={() => {}} />
                    <LocationsDrawer />
                    <CourseInfoSheet />
                </ScreenChromeContext.Provider>
            </ClubPortalScope>
        </CourseProvider>
    );
};
