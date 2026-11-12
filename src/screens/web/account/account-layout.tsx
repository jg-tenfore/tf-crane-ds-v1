import { useLayoutEffect, useRef, type FC, type ReactNode } from "react";
import { Award05, ClockRewind, Home01, LogOut01, Ticket02, User01, Users01, Wallet02 } from "@untitledui/icons";
import { CapsTabs, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { WebShell, useWebSession } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { WebButton } from "./account-ui";

export type AccountSection = "overview" | "my-account" | "activity" | "wallet" | "buddies" | "events" | "memberships";

interface NavItem {
    id: AccountSection;
    label: string;
    /** Mobile-web tab label. */
    short: string;
    href: string;
    icon: FC<{ className?: string }>;
}

/** Fox's 6 buckets (Overview → Events) + Memberships pinned below a divider. */
export const ACCOUNT_NAV: NavItem[] = [
    { id: "overview", label: "Overview", short: "Overview", href: "/account", icon: Home01 },
    { id: "my-account", label: "My Account", short: "My Account", href: "/account/my-account", icon: User01 },
    { id: "activity", label: "Activity", short: "Activity", href: "/account/activity", icon: ClockRewind },
    { id: "wallet", label: "Wallet", short: "Wallet", href: "/account/wallet", icon: Wallet02 },
    { id: "buddies", label: "Golf Buddies", short: "Buddies", href: "/account/buddies", icon: Users01 },
    { id: "events", label: "Events", short: "Events", href: "/account/events", icon: Ticket02 },
];
export const MEMBERSHIPS_NAV: NavItem = { id: "memberships", label: "Memberships", short: "Memberships", href: "/account/memberships", icon: Award05 };

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

const NavRow = ({ item, active }: { item: NavItem; active: boolean }) => (
    <WebLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cx(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-md transition duration-100 ease-linear",
            active ? "bg-brand-primary_alt font-semibold text-brand-secondary" : "text-secondary hover:bg-primary_hover hover:text-primary",
            focus,
        )}
    >
        <item.icon className={cx("size-5 shrink-0", active ? "text-fg-brand-primary" : "text-fg-quaternary")} aria-hidden="true" />
        {item.label}
    </WebLink>
);

/** Sign out: clear the web session and land on Sign in. */
export const useSignOut = () => {
    const { setUserName } = useWebSession();
    const { navigate } = useWebRouter();
    return () => {
        setUserName(null);
        navigate("/sign-in");
    };
};

const SignOutRow = () => {
    const signOut = useSignOut();
    return (
        <button
            type="button"
            onClick={signOut}
            className={cx("flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-md text-secondary transition duration-100 ease-linear hover:bg-primary_hover hover:text-primary", focus)}
        >
            <LogOut01 className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
            Sign out
        </button>
    );
};

const Who = () => {
    const { userName } = useWebSession();
    return (
        <div>
            <div className="caps text-brand-secondary">My Profile</div>
            <p className="mt-1 truncate text-xl font-semibold tracking-[-0.3px] text-primary">
                {userName ?? USER.firstName} {USER.lastName}
            </p>
            <p className="truncate text-sm text-tertiary">{USER.email}</p>
        </div>
    );
};

/** Desktop/laptop: left side nav (Overview … Events · Memberships · Sign out). */
const SideNav = ({ active }: { active: AccountSection }) => (
    <aside className="hidden w-52 shrink-0 self-start @desktop:sticky @desktop:top-[136px] @desktop:block @min-[1200px]:w-60">
        <Who />
        <nav aria-label="Account" className="mt-6 flex flex-col gap-0.5">
            {ACCOUNT_NAV.map((item) => (
                <NavRow key={item.id} item={item} active={item.id === active} />
            ))}
            <div className="my-3 h-px bg-border-secondary" role="separator" />
            <NavRow item={MEMBERSHIPS_NAV} active={active === "memberships"} />
            <div className="my-3 h-px bg-border-secondary" role="separator" />
            <SignOutRow />
        </nav>
    </aside>
);

/**
 * Mobile web + tablet: a "My Profile" eyebrow and a horizontal CapsTabs row. The current tab
 * is scrolled into view so deep links (/account/events) land with their tab visible.
 */
const TopNav = ({ active }: { active: AccountSection }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const nav = ref.current?.querySelector("nav");
        const current = nav?.querySelector<HTMLElement>("[aria-current=page]");
        if (nav && current) nav.scrollLeft = Math.max(0, current.offsetLeft - 16);
    }, [active]);
    return (
        <div ref={ref} className="@desktop:hidden">
            <p className="caps text-brand-secondary">My Profile</p>
            <CapsTabs
                label="Account"
                className="-mx-4 mt-3 border-b border-secondary px-4 @tablet:-mx-8 @tablet:px-8"
                tabs={[...ACCOUNT_NAV, MEMBERSHIPS_NAV].map((i) => ({ href: i.href, label: i.short, active: i.id === active }))}
            />
        </div>
    );
};

const MobileSignOut = () => {
    const signOut = useSignOut();
    return (
        <div className="mt-10 border-t border-secondary pt-6 @desktop:hidden">
            <WebButton color="outline" fullWidth iconLeading={LogOut01} onPress={signOut}>
                Sign out
            </WebButton>
        </div>
    );
};

/**
 * AccountLayout — every Crane Web account page: the WebShell chrome, then a left side nav
 * at ≥1024 (narrower on laptop) or the "My Profile" CapsTabs row below that, then content.
 */
export const AccountLayout = ({ active, children }: { active: AccountSection; children: ReactNode }) => (
    <WebShell>
        <WebPage>
            <div className="flex flex-col gap-6 @desktop:flex-row @desktop:gap-10 @min-[1200px]:gap-14">
                <SideNav active={active} />
                <TopNav active={active} />
                <div className="min-w-0 flex-1">
                    {children}
                    <MobileSignOut />
                </div>
            </div>
        </WebPage>
    </WebShell>
);
