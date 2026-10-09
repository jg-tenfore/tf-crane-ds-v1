import { createContext, useContext, useState, type ReactNode } from "react";
import { Calendar, Home02, User01 } from "@untitledui/icons";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar, type TabBarItem } from "@/components/navigation/tab-bar";
import { StackNavigator, type Route, type ScreenRegistry, type StackNavigatorProps } from "./stack-navigator";

export type CraneTab = "home" | "bookings" | "profile";

/** Crane's three root tabs, in order. Badge counts are passed in by the shell. */
export const CRANE_TABS: TabBarItem[] = [
    { id: "home", label: "Home", icon: Home02 },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "profile", label: "Profile", icon: User01 },
];

export interface AppShellProps {
    /** One screen registry per tab — each tab keeps its own navigation stack. */
    stacks: Record<CraneTab, Pick<StackNavigatorProps, "screens" | "initialRoute" | "initialStack" | "onStackChange">>;
    initialTab?: CraneTab;
    /** Controlled tab. Pair with onTabChange. */
    tab?: CraneTab;
    onTabChange?: (tab: CraneTab) => void;
    /** Badge counts per tab, e.g. { profile: 1 } for an unread community post. */
    badges?: Partial<Record<CraneTab, number>>;
    /** Content layered above every tab (global drawers, toasts). */
    overlay?: ReactNode;
}

const AppShellContext = createContext<{ tab: CraneTab; setTab: (tab: CraneTab) => void } | null>(null);

/** Switch tabs from any screen (e.g. "View" in a toast → Bookings). No-op outside an AppShell. */
export const useAppShell = () => useContext(AppShellContext) ?? { tab: "home" as CraneTab, setTab: () => {} };

/**
 * AppShell — the Crane app's global chrome: a floating Liquid Glass TabBar over
 * three independent navigation stacks (Home, Bookings, Profile). Switching tabs
 * preserves each tab's stack, exactly like UITabBarController.
 */
export const AppShell = ({ stacks, initialTab = "home", tab: controlledTab, onTabChange, badges = {}, overlay }: AppShellProps) => {
    const [innerTab, setInnerTab] = useState<CraneTab>(initialTab);
    const tab = controlledTab ?? innerTab;
    const setTab = (t: CraneTab) => {
        setInnerTab(t);
        onTabChange?.(t);
    };
    const items = CRANE_TABS.map((t) => ({ ...t, badge: badges[t.id as CraneTab] }));

    return (
        <AppShellContext.Provider value={{ tab, setTab }}>
            <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
                <div className="absolute inset-0">
                    {(Object.keys(stacks) as CraneTab[]).map((id) => (
                        // Keep every stack mounted so each tab remembers where you were.
                        <div key={id} className="absolute inset-0" hidden={id !== tab}>
                            <StackNavigator {...stacks[id]} />
                        </div>
                    ))}
                    <TabBar items={items} activeId={tab} onChange={(id) => setTab(id as CraneTab)} />
                    {overlay}
                </div>
            </ScreenChromeContext.Provider>
        </AppShellContext.Provider>
    );
};
