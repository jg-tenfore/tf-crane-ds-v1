import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Laptop01, LayoutLeft, LogIn01, LogOut01, Maximize01, Monitor01, Moon01, Phone01, RefreshCcw01, Sun, Tablet01 } from "@untitledui/icons";
import { CraneAppIcon } from "@/components/foundations/logos";
import { WEB_WIDTHS, WebFrame, type WebWidth } from "@/components/web/web-frame";
import type { WebOrg } from "@/components/web/web-org";
import { courseById, USER } from "@/data/crane";
import { giftCardsHref, SAMPLE_GIFT_ORDER, SAMPLE_SELF_ORDER } from "@/data/gift-cards";
import { productById, productPath, SHOP_PRODUCTS } from "@/data/shop";
import { accountRoutes } from "@/screens/web/account";
import type { CategoryNavVariant } from "@/screens/web/browse";
import { useCart } from "@/screens/web/cart-store";
import { checkoutPath, confirmationPath, DAYS, defaultTeeTime, seedPlayers, type Player } from "@/screens/web/tee-times/tee-times-data";
import { CraneWebRoutes } from "@/screens/web/web-app";
import { useWebSession } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { FullWindowApp, HOME, IPHONE_URL, PrototypePill, STORYBOOK_URL, useHashRouting, useWebRoutes, WebAppProviders, type HashRouting } from "./web-prototype";

/* ---------- Jump-to-screen index (real routes + ids from the data files) ---------- */

const teeDay = DAYS[3].id; // a few days out (free cancellation applies)
const sagamore = courseById("sagamore-spring");
const teeTime = defaultTeeTime(sagamore, teeDay, 2).id;
const product = productById("ball-titleist-pro-v1-dozen") ?? SHOP_PRODUCTS.find((p) => p.group === "golf-balls") ?? SHOP_PRODUCTS[0];

/** A jump-list section: label + [screen label, path] pairs. */
export interface ScreenGroup {
    label: string;
    items: [label: string, path: string][];
}

/** The Crane Web jump list (prototype/web/). */
export const CRANE_WEB_SCREEN_GROUPS: ScreenGroup[] = [
    {
        label: "Tee Times",
        items: [
            ["Tee sheet", "/tee-times"],
            ["Checkout", checkoutPath({ date: teeDay, teeTimeId: teeTime, players: 2 })],
            ["Confirmation", confirmationPath({ date: teeDay, teeTimeId: teeTime, players: seedPlayers(2).filter((p): p is Player => !!p), holes: 18, transport: "cart" })],
            ["My Rounds", "/tee-times/my-rounds"],
            ["My Rounds · Past", "/tee-times/my-rounds/past"],
        ],
    },
    {
        label: "Shop",
        items: [
            ["Shop home", "/shop"],
            ["Category · Golf Balls", "/shop/golf-balls"],
            ["Subgroup · Dozens", "/shop/golf-balls/dozens"],
            ["Product", productPath(product)],
            ["Gift cards", "/shop/gift-cards"],
            ["Gift cards · filled in", giftCardsHref(SAMPLE_GIFT_ORDER)],
            ["Gift cards · for me", giftCardsHref(SAMPLE_SELF_ORDER)],
            ["Gift cards · print", giftCardsHref({ ...SAMPLE_GIFT_ORDER, delivery: "print", toEmail: "", toEmailConfirm: "" })],
            ["Punch cards", "/shop/punch-cards"],
        ],
    },
    {
        label: "Checkout",
        items: [
            ["Cart", "/cart"],
            ["Add more", "/cart/add-more"],
            ["Checkout", "/checkout"],
            ["Order confirmation", "/order/SG-100482"],
        ],
    },
    {
        label: "Restaurant",
        items: [
            ["Menu", "/restaurant"],
            ["Section · Burgers & Dogs", "/restaurant/burgers-and-dogs"],
        ],
    },
    {
        label: "Events · Clinics · Leagues",
        items: [
            ["Events", "/events"],
            ["Event details", "/events/fall-foliage-scramble"],
            ["Clinics", "/clinics"],
            ["Clinic details", "/clinics/short-game-series"],
            ["Leagues", "/leagues"],
            ["League details", "/leagues/wednesday-9-and-dine"],
            ["Activities", "/activities"],
            ["Calendar", "/calendar"],
            ["Calendar · List", "/calendar?view=list"],
        ],
    },
    {
        label: "Profile ∕ Account",
        // "/account/activity/:view?/:order?" → "/account/activity"
        items: accountRoutes.map((r) => [r.title, r.pattern.replace(/\/:[^/]+\?/g, "")]),
    },
    {
        label: "Sign in ∕ Sign up",
        items: [
            ["Sign in", "/sign-in"],
            ["Sign up", "/sign-up"],
            ["Forgot password", "/forgot-password"],
            ["Verify email", `/verify-email?email=${encodeURIComponent(USER.email)}`],
            ["Choose home course", "/welcome/home-course"],
        ],
    },
];

/** The jump-list entry for the current path: exact match first, then same pathname. */
const activeItem = (path: string, groups: ScreenGroup[]) => {
    const all = groups.flatMap((g) => g.items.map(([, p]) => p));
    const bare = (p: string) => p.split("?")[0].replace(/\/$/, "") || "/";
    return all.find((p) => p === path) ?? all.find((p) => bare(p) === bare(path)) ?? null;
};

/* ---------- Preferences (persisted) ---------- */

type Mode = "review" | "full";
interface Prefs {
    width: WebWidth;
    dark: boolean;
    mode: Mode;
    shopNav: CategoryNavVariant;
}
const PREFS_KEY = "crane-web-presenter";
const DEFAULT_PREFS: Prefs = { width: "desktop", dark: false, mode: "review", shopNav: "tabs" };

const loadPrefs = (key: string): Prefs => {
    try {
        const p = JSON.parse(localStorage.getItem(key) ?? "{}") as Partial<Prefs>;
        return {
            width: p.width && p.width in WEB_WIDTHS ? p.width : DEFAULT_PREFS.width,
            dark: typeof p.dark === "boolean" ? p.dark : DEFAULT_PREFS.dark,
            mode: p.mode === "full" ? "full" : "review",
            shopNav: p.shopNav === "sidebar" ? "sidebar" : "tabs",
        };
    } catch {
        return DEFAULT_PREFS;
    }
};
const savePrefs = (key: string, p: Prefs) => {
    try {
        localStorage.setItem(key, JSON.stringify(p));
    } catch {
        /* private mode / storage full: prefs just don't persist */
    }
};

const PHONE_QUERY = "(max-width: 600px) and (pointer: coarse)";
const isPhoneNow = () => typeof matchMedia !== "undefined" && matchMedia(PHONE_QUERY).matches;

/* ---------- Presenter ---------- */

/**
 * CraneWebPresenter — the Crane Web review tool (prototype/web/). Review mode shows the app in
 * a browser frame at a chosen width (fit to the window) with a side panel to jump to any screen,
 * switch width / appearance / shop nav, toggle sign-in and start over. Full window is the bare
 * app at real window breakpoints (the default on phones). Router, session and cart sit above
 * the frame, so changing width keeps the page and the cart.
 */
export interface CraneWebPresenterProps {
    /** Panel title (default "Crane Web prototype"). */
    title?: string;
    /** Host shown under the title and in the frame's address bar (default crane.tenfore.golf). */
    host?: string;
    /** Start / "Start over" path (default /tee-times). */
    home?: string;
    /** localStorage key for width / appearance / mode prefs. */
    storageKey?: string;
    /** The jump list (default: every Crane Web screen). */
    groups?: ScreenGroup[];
    /** Organization site (e.g. MCG_ORG) — the app renders with that org's chrome. */
    org?: WebOrg | null;
    /** Storybook link in the panel and pill. */
    storybookUrl?: string;
    /** Show the Shop nav (tabs | sidebar) switch (default true). */
    showShopNav?: boolean;
    /** Links to the sibling prototypes, under the Storybook link (default: iPhone + MCG). */
    links?: { label: string; href: string }[];
}

interface PresenterConfig {
    title: string;
    host: string;
    home: string;
    groups: ScreenGroup[];
    storybookUrl: string;
    showShopNav: boolean;
    links: { label: string; href: string }[];
}

export const CraneWebPresenter = ({
    title = "Crane Web prototype",
    host = "crane.tenfore.golf",
    home = HOME,
    storageKey = PREFS_KEY,
    groups = CRANE_WEB_SCREEN_GROUPS,
    org = null,
    storybookUrl = STORYBOOK_URL,
    showShopNav = true,
    // Sibling builds sit next to each other: / (iPhone), /web/ (Crane Web), /mcg/ (MCG).
    links = [
        { label: "iPhone prototype", href: IPHONE_URL },
        { label: "MCG prototype", href: "../mcg/" },
    ],
}: CraneWebPresenterProps = {}) => {
    const routing = useHashRouting(home);
    const [prefs, setPrefs] = useState<Prefs>(() => {
        const p = loadPrefs(storageKey);
        return isPhoneNow() ? { ...p, mode: "full" } : p;
    });
    useEffect(() => savePrefs(storageKey, prefs), [storageKey, prefs]);
    const set = (patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch }));
    const config: PresenterConfig = { title, host, home, groups, storybookUrl, showShopNav, links };

    return (
        <WebAppProviders routing={routing} org={org}>
            {prefs.mode === "full" ? (
                <div className="h-dvh w-screen">
                    <FullWindowApp shopNav={prefs.shopNav} dark={prefs.dark} />
                    <PrototypePill
                        label={title}
                        storybookUrl={storybookUrl}
                        home={home}
                        onStartOver={() => routing.restart(home)}
                        extra={
                            <button type="button" className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/10" onClick={() => set({ mode: "review" })}>
                                <LayoutLeft className="size-4" aria-hidden="true" /> Show review panel
                            </button>
                        }
                    />
                </div>
            ) : (
                <ReviewMode routing={routing} prefs={prefs} set={set} config={config} />
            )}
        </WebAppProviders>
    );
};

const WIDTH_OPTIONS: [WebWidth, string, typeof Monitor01][] = [
    ["desktop", "Desktop", Monitor01],
    ["laptop", "Laptop", Laptop01],
    ["tablet", "Tablet", Tablet01],
    ["mobile", "Mobile", Phone01],
];

const ReviewMode = ({ routing, prefs, set, config }: { routing: HashRouting; prefs: Prefs; set: (p: Partial<Prefs>) => void; config: PresenterConfig }) => {
    const { userName, setUserName } = useWebSession();
    const cart = useCart();
    const routes = useWebRoutes(prefs.shopNav);
    const active = activeItem(routing.path, config.groups);
    const activeRef = useRef<HTMLAnchorElement>(null);

    // Keep the highlighted screen in view when the page changes from inside the app.
    useEffect(() => {
        activeRef.current?.scrollIntoView({ block: "nearest" });
    }, [active]);

    return (
        <div className="flex h-dvh w-screen overflow-hidden bg-secondary font-body text-primary">
            <aside aria-label="Prototype controls" className="flex w-[300px] shrink-0 flex-col border-r border-secondary bg-primary">
                <div className="flex items-center gap-3 border-b border-secondary px-5 py-4">
                    <CraneAppIcon size={40} />
                    <div className="min-w-0">
                        <div className="text-md font-semibold">{config.title}</div>
                        <div className="text-xs text-tertiary">{config.host}</div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-secondary px-5 py-3 text-sm">
                    <div className="min-w-0">
                        <div className="text-xs text-quaternary">{userName ? "Signed in" : "Browsing as a guest"}</div>
                        <div className="truncate text-secondary">
                            {userName ? `${USER.firstName} ${USER.lastName}` : "Not signed in"}
                            {cart.count > 0 && <span className="text-tertiary"> · {cart.count} in cart</span>}
                        </div>
                    </div>
                    <PanelButton icon={userName ? LogOut01 : LogIn01} onClick={() => setUserName(userName ? null : USER.firstName)}>
                        {userName ? "Sign out" : "Sign in"}
                    </PanelButton>
                </div>

                <nav aria-label="Jump to screen" className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3">
                    {config.groups.map((g) => (
                        <div key={g.label} className="mb-3">
                            <div className="px-2 pb-1 text-xs font-semibold tracking-wide text-quaternary uppercase">{g.label}</div>
                            {g.items.map(([label, path]) => {
                                const isActive = path === active;
                                return (
                                    <a
                                        key={path}
                                        ref={isActive ? activeRef : undefined}
                                        href={`#${path}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            routing.jump(path);
                                        }}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cx(
                                            "block rounded-lg px-2 py-1.5 text-sm transition duration-100 ease-linear",
                                            isActive ? "bg-brand-primary_alt font-semibold text-brand-secondary" : "text-secondary hover:bg-primary_hover",
                                        )}
                                    >
                                        {label}
                                    </a>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="space-y-3 border-t border-secondary px-5 py-4">
                    <div role="radiogroup" aria-label="Width" className="space-y-1.5">
                        <span className="text-xs font-medium text-tertiary">Width</span>
                        <div className="flex rounded-lg bg-tertiary p-0.5">
                            {WIDTH_OPTIONS.map(([w, text, Icon]) => (
                                <button
                                    key={w}
                                    type="button"
                                    role="radio"
                                    aria-checked={prefs.width === w}
                                    aria-label={`${text} ${WEB_WIDTHS[w]}`}
                                    onClick={() => set({ width: w })}
                                    className={cx(
                                        "flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-md py-1 transition duration-100 ease-linear",
                                        prefs.width === w ? "bg-primary text-primary shadow-xs" : "text-tertiary hover:text-secondary",
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                    <span className="text-xs font-medium">{text}</span>
                                    <span className="text-[10px] text-quaternary tabular-nums">{WEB_WIDTHS[w]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Segmented
                        label="Appearance"
                        value={prefs.dark ? "dark" : "light"}
                        onChange={(v) => set({ dark: v === "dark" })}
                        options={[
                            ["light", "Light", Sun],
                            ["dark", "Dark", Moon01],
                        ]}
                    />
                    {config.showShopNav && (
                    <Segmented
                        label="Shop nav"
                        value={prefs.shopNav}
                        onChange={(v) => set({ shopNav: v as CategoryNavVariant })}
                        options={[
                            ["tabs", "Tabs"],
                            ["sidebar", "Sidebar"],
                        ]}
                    />
                    )}
                    <div className="flex gap-2">
                        <PanelButton icon={Maximize01} onClick={() => set({ mode: "full" })} className="flex-1 justify-center">
                            Full window
                        </PanelButton>
                        <PanelButton icon={RefreshCcw01} onClick={() => routing.restart(config.home)} className="flex-1 justify-center">
                            Start over
                        </PanelButton>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
                        <PanelLink href={config.storybookUrl} newTab>
                            Storybook
                        </PanelLink>
                        {config.links.map((l) => (
                            <PanelLink key={l.href} href={l.href}>
                                {l.label}
                            </PanelLink>
                        ))}
                    </div>
                </div>
            </aside>

            <FitStage width={prefs.width} url={`${config.host}${routing.path}`} dark={prefs.dark}>
                <CraneWebRoutes routes={routes} />
            </FitStage>
        </div>
    );
};

/* ---------- Stage: the WebFrame scaled to fit the remaining space ---------- */

const CHROME_H = 44; // WebFrame's simulated browser bar
const PAD = 24;
const MOBILE_MAX_H = 844;

const FitStage = ({ width, url, dark, children }: { width: WebWidth; url: string; dark: boolean; children: ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState({ w: 1100, h: 800 });
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const w = WEB_WIDTHS[width];
    const availW = Math.max(200, box.w - PAD * 2);
    const availH = Math.max(300, box.h - PAD * 2);
    // Scale to fit the width, then give the page whatever height fills the stage at that scale.
    const scale = Math.min(1, availW / w);
    const fullH = Math.floor(availH / scale) - CHROME_H;
    const h = Math.max(360, width === "mobile" ? Math.min(MOBILE_MAX_H, fullH) : fullH);

    return (
        <div ref={ref} data-stage="" className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
            <div style={{ width: w * scale, height: (h + CHROME_H) * scale }}>
                <div style={{ width: w, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                    <WebFrame width={width} height={h} url={url} dark={dark} fit={false}>
                        {children}
                    </WebFrame>
                </div>
            </div>
            {scale < 1 && <span className="absolute right-3 bottom-2 text-[11px] text-quaternary tabular-nums">{Math.round(scale * 100)}%</span>}
        </div>
    );
};

/* ---------- Panel controls (same look as the iPhone presenter) ---------- */

const PanelButton = ({ icon: Icon, children, onClick, className }: { icon: typeof LogIn01; children: ReactNode; onClick: () => void; className?: string }) => (
    <button
        type="button"
        onClick={onClick}
        className={cx(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-primary transition duration-100 ease-linear ring-inset hover:bg-primary_hover focus-visible:ring-2 focus-visible:ring-brand",
            className,
        )}
    >
        <Icon className="size-4" aria-hidden="true" />
        {children}
    </button>
);

const PanelLink = ({ href, newTab, children }: { href: string; newTab?: boolean; children: ReactNode }) => (
    <a
        href={href}
        {...(newTab ? { target: "_blank", rel: "noreferrer" } : {})}
        className="flex items-center gap-1 rounded-md px-1 py-0.5 text-sm font-semibold whitespace-nowrap text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover hover:underline"
    >
        {children}
        <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
);

const Segmented = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string, typeof Phone01?][] }) => (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-3">
        <span className="w-[76px] text-xs font-medium text-tertiary">{label}</span>
        <div className="flex flex-1 rounded-lg bg-tertiary p-0.5">
            {options.map(([v, text, Icon]) => (
                <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={value === v}
                    onClick={() => onChange(v)}
                    className={cx(
                        "flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md py-1 text-xs font-medium transition duration-100 ease-linear",
                        value === v ? "bg-primary text-primary shadow-xs" : "text-tertiary hover:text-secondary",
                    )}
                >
                    {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                    {text}
                </button>
            ))}
        </div>
    </div>
);
