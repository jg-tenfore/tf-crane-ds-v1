import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { LogOut01, Trash01, Wallet02 } from "@untitledui/icons";
import { useToast } from "@/components/feedback/toast";
import { AppShell } from "@/components/prototype/app-shell";
import { StackNavigator, useStack, type ScreenRegistry } from "@/components/prototype/stack-navigator";
import { ChooseHomeCourseScreen, SignedInScreen, authScreens } from "@/screens/auth";
import { BookingsProvider } from "@/screens/bookings/bookings-store";
import { bookingsScreens } from "@/screens/bookings";
import { CourseInfoSheet, CourseProvider, LocationsDrawer } from "@/screens/chrome";
import { homeScreens } from "@/screens/home";
import { AppearanceScreen, CommunityScreen, ProfileScreen, profileScreens } from "@/screens/profile";
import { TAB_ROOTS, defaultState, type PrototypeState } from "./prototype-state";

type Update = Dispatch<SetStateAction<PrototypeState>>;

/* ---------- Signed out: onboarding ---------- */

/** Choose Home Course → remember the picks so they become My Courses after sign-up. */
const HomeCourseStep = ({ onPick }: { onPick: (ids: string[]) => void }) => {
    const { push } = useStack();
    return (
        <ChooseHomeCourseScreen
            onContinue={(ids) => {
                onPick(ids);
                push("signed-in", { mode: "sign-up", courses: ids });
            }}
        />
    );
};

const AuthFlow = ({ state, update }: { state: PrototypeState; update: Update }) => {
    const screens = useMemo<ScreenRegistry>(
        () => ({
            ...authScreens,
            "home-course": () => <HomeCourseStep onPick={(ids) => update((s) => ({ ...s, savedCourseIds: ids.length ? ids : undefined, courseId: ids[0] ?? s.courseId }))} />,
            "signed-in": (p) => (
                <SignedInScreen
                    mode={p.mode === "sign-up" ? "sign-up" : "sign-in"}
                    courses={Array.isArray(p.courses) ? (p.courses as string[]) : []}
                    onDone={() =>
                        update((s) => ({
                            ...s,
                            signedIn: true,
                            tab: "home",
                            stacks: { home: [{ name: TAB_ROOTS.home }], bookings: [{ name: TAB_ROOTS.bookings }], profile: [{ name: TAB_ROOTS.profile }] },
                        }))
                    }
                />
            ),
        }),
        [update],
    );

    return (
        <StackNavigator
            screens={screens}
            initialRoute="welcome"
            initialStack={state.authStack}
            onStackChange={(authStack) => update((s) => (s.signedIn ? s : { ...s, authStack }))}
        />
    );
};

/* ---------- Signed in: the app ---------- */

const CommunityStep = ({ onSeen }: { onSeen: () => void }) => {
    useEffect(onSeen, [onSeen]);
    return <CommunityScreen />;
};

const SignedInApp = ({ state, update }: { state: PrototypeState; update: Update }) => {
    const toast = useToast();

    const profile = useMemo<ScreenRegistry>(
        () => ({
            ...profileScreens,
            profile: () => (
                <ProfileScreen
                    communityBadge={state.communitySeen ? 0 : 1}
                    onAddToWallet={() => toast.show({ title: "Wallet pass added to Apple Wallet", icon: Wallet02 })}
                    onSignOut={() => {
                        update((s) => ({ ...s, signedIn: false, authStack: [{ name: "welcome" }] }));
                        toast.show({ title: "Signed out", icon: LogOut01 });
                    }}
                    onDeleteAccount={() => {
                        update(() => defaultState());
                        toast.show({ title: "Account deleted", icon: Trash01 });
                    }}
                />
            ),
            appearance: () => <AppearanceScreen defaultMode={state.appearance} onChange={(appearance) => update((s) => ({ ...s, appearance }))} />,
            community: () => <CommunityStep onSeen={() => update((s) => (s.communitySeen ? s : { ...s, communitySeen: true }))} />,
        }),
        // The registry is read on every render of the stack, so badge/appearance stay current.
        [state.communitySeen, state.appearance, toast, update],
    );

    const stackChange = (tab: keyof PrototypeState["stacks"]) => (stack: PrototypeState["stacks"]["home"]) =>
        update((s) => ({ ...s, stacks: { ...s.stacks, [tab]: stack } }));

    return (
        <CourseProvider
            initialCourseId={state.courseId}
            initialSavedIds={state.savedCourseIds}
            onChange={({ courseId, savedIds }) => update((s) => ({ ...s, courseId, savedCourseIds: savedIds }))}
        >
            <BookingsProvider initial={state.bookings} onChange={(bookings) => update((s) => ({ ...s, bookings }))}>
                <AppShell
                    tab={state.tab}
                    onTabChange={(tab) => update((s) => ({ ...s, tab }))}
                    badges={{ profile: state.communitySeen ? 0 : 1 }}
                    stacks={{
                        home: { screens: homeScreens, initialRoute: "home", initialStack: state.stacks.home, onStackChange: stackChange("home") },
                        bookings: { screens: bookingsScreens, initialRoute: "bookings", initialStack: state.stacks.bookings, onStackChange: stackChange("bookings") },
                        profile: { screens: profile, initialRoute: "profile", initialStack: state.stacks.profile, onStackChange: stackChange("profile") },
                    }}
                    overlay={
                        <>
                            <LocationsDrawer />
                            <CourseInfoSheet />
                        </>
                    }
                />
            </BookingsProvider>
        </CourseProvider>
    );
};

/**
 * CranePrototype — every Storybook screen stitched into one app. Renders inside an
 * IPhoneFrame (and its ToastProvider); all state lives in the parent so it can be
 * persisted and deep-linked.
 */
export const CranePrototype = ({ state, update }: { state: PrototypeState; update: Update }) =>
    state.signedIn ? <SignedInApp key="app" state={state} update={update} /> : <AuthFlow key="auth" state={state} update={update} />;
