import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, LogIn01, LogOut01, Phone01, RefreshCcw01, Monitor01 } from "@untitledui/icons";
import { IPhoneFrame, IPHONE_17 } from "@/components/device/iphone-frame";
import { ToastProvider } from "@/components/feedback/toast";
import { CraneAppIcon } from "@/components/foundations/logos";
import { USER } from "@/data/crane";
import type { AppearanceMode } from "@/screens/profile/appearance-screen";
import { cx } from "@/utils/cx";
import { CranePrototype } from "./crane-prototype";
import { TAB_ROOTS, applyHash, clearState, defaultState, loadState, saveState, toHash, type PrototypeState } from "./prototype-state";

/* ---------- Screen index for the side panel ---------- */

const SCREEN_GROUPS: { label: string; items: [string, string][] }[] = [
    {
        label: "Sign in ∕ Sign up",
        items: [
            ["Welcome", "#/auth/welcome"],
            ["Sign In", "#/auth/welcome/sign-in"],
            ["Forgot Password", "#/auth/welcome/sign-in/forgot-password"],
            ["Sign Up", "#/auth/welcome/sign-up"],
            ["Verify Email", "#/auth/welcome/sign-up/verify-email"],
            ["Choose Home Course", "#/auth/welcome/sign-up/verify-email/home-course"],
        ],
    },
    { label: "Home", items: [["Tee Sheet", "#/home"]] },
    {
        label: "Bookings",
        items: [
            ["Reservations & Purchases", "#/bookings"],
            ["Tee Time Details", "#/bookings/tee-time-details:b-2"],
            ["Purchase Details", "#/bookings/purchase-details:p-1"],
        ],
    },
    {
        label: "Profile ∕ Account",
        items: [
            ["Profile", "#/profile"],
            ["Edit Profile", "#/profile/edit-profile"],
            ["Account Balance", "#/profile/account-balance"],
            ["Payment Methods", "#/profile/payment-methods"],
            ["Add Payment Method", "#/profile/payment-methods/add-payment-method"],
            ["Golf Buddies", "#/profile/golf-buddies"],
            ["Memberships", "#/profile/memberships"],
            ["Waitlist", "#/profile/waitlist"],
            ["Punch Cards", "#/profile/punch-cards"],
            ["Rain Checks", "#/profile/rain-checks"],
            ["Gift Cards", "#/profile/gift-cards"],
            ["Appearance", "#/profile/appearance"],
            ["Community", "#/profile/community"],
            ["Kiosk Sign-In", "#/profile/kiosk-sign-in"],
        ],
    },
];

/** Storybook lives on :6021 locally and one level up from /prototype/ on GitHub Pages. */
const STORYBOOK_URL = typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname) ? `${location.protocol}//${location.hostname}:6021/` : "../";

/* ---------- Hooks ---------- */

const useMedia = (query: string) => {
    const get = () => typeof matchMedia !== "undefined" && matchMedia(query).matches;
    const [match, setMatch] = useState(get);
    useEffect(() => {
        const m = matchMedia(query);
        const on = () => setMatch(m.matches);
        m.addEventListener("change", on);
        return () => m.removeEventListener("change", on);
    }, [query]);
    return match;
};

/** Scale factor that fits `w × h` inside the element, never upscaling. */
const useFitScale = (w: number, h: number) => {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([e]) => {
            const { width, height } = e.contentRect;
            setScale(Math.min(1, (width - 32) / w, (height - 32) / h));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [w, h]);
    return { ref, scale };
};

const initialState = (): PrototypeState => {
    if (location.hash === "#/reset") {
        clearState();
        history.replaceState(null, "", location.pathname + location.search);
        return defaultState();
    }
    return applyHash(loadState() ?? defaultState(), location.hash);
};

/* ---------- Presenter ---------- */

/**
 * Presenter — the page around the prototype. On a desktop it shows the phone (fit to
 * the window) with a control panel; on a real phone the prototype goes full-screen.
 */
export const Presenter = () => {
    const [state, setState] = useState(initialState);
    const [session, setSession] = useState(0); // bump to remount the app (jump / reset)
    const [frame, setFrame] = useState<"device" | "bare">("device");
    const isPhone = useMedia("(max-width: 600px) and (pointer: coarse)");
    const prefersDark = useMedia("(prefers-color-scheme: dark)");
    const dark = state.appearance === "dark" || (state.appearance === "system" && prefersDark);

    // Persist + mirror the current screen into the URL (replaceState: no history spam).
    useEffect(() => {
        saveState(state);
        const hash = toHash(state);
        if (location.hash !== hash) history.replaceState(null, "", hash);
    }, [state]);

    // Typing a deep link / pressing browser Back re-routes the prototype.
    useEffect(() => {
        const onHash = () => {
            if (location.hash === "#/reset") return reset();
            setState((s) => applyHash(s, location.hash));
            setSession((n) => n + 1);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    });

    const jump = (hash: string) => {
        setState((s) => applyHash(s, hash));
        setSession((n) => n + 1);
    };
    const reset = useCallback(() => {
        clearState();
        setState(defaultState());
        setSession((n) => n + 1);
    }, []);
    const setAppearance = (appearance: AppearanceMode) => {
        setState((s) => ({ ...s, appearance }));
        setSession((n) => n + 1); // Appearance screen reads its value on mount
    };

    const app = (
        <ToastProvider>
            <CranePrototype key={session} state={state} update={setState} />
        </ToastProvider>
    );

    if (isPhone) {
        return (
            <div className="h-dvh w-screen overflow-hidden bg-secondary">
                <IPhoneFrame variant="fullscreen" dark={dark}>
                    {app}
                </IPhoneFrame>
            </div>
        );
    }

    const current = toHash(state);

    return (
        <div className="flex h-dvh w-screen overflow-hidden bg-secondary font-body text-primary">
            <aside className="flex w-[300px] shrink-0 flex-col border-r border-secondary bg-primary">
                <div className="flex items-center gap-3 border-b border-secondary px-5 py-4">
                    <CraneAppIcon size={40} />
                    <div className="min-w-0">
                        <div className="text-md font-semibold">Crane prototype</div>
                        <div className="text-xs text-tertiary">
                            iPhone 17 · {IPHONE_17.width} × {IPHONE_17.height}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-b border-secondary px-5 py-3 text-sm">
                    <span className="truncate text-tertiary">{state.signedIn ? `Signed in as ${USER.firstName} ${USER.lastName}` : "Signed out"}</span>
                    <PanelButton
                        icon={state.signedIn ? LogOut01 : LogIn01}
                        onClick={() => jump(state.signedIn ? "#/auth/welcome" : `#/${state.tab}`)}
                    >
                        {state.signedIn ? "Sign out" : "Skip sign-in"}
                    </PanelButton>
                </div>

                <nav aria-label="Jump to screen" className="scrollbar-hide flex-1 overflow-y-auto px-3 py-3">
                    {SCREEN_GROUPS.map((g) => (
                        <div key={g.label} className="mb-3">
                            <div className="px-2 pb-1 text-xs font-semibold tracking-wide text-quaternary uppercase">{g.label}</div>
                            {g.items.map(([label, hash]) => {
                                const active = normalize(hash) === normalize(current);
                                return (
                                    <a
                                        key={hash}
                                        href={hash}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            jump(hash);
                                        }}
                                        aria-current={active ? "page" : undefined}
                                        className={cx(
                                            "block rounded-lg px-2 py-1.5 text-sm transition duration-100 ease-linear",
                                            active ? "bg-brand-primary_alt font-semibold text-brand-secondary" : "text-secondary hover:bg-primary_hover",
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
                    <Segmented
                        label="Frame"
                        value={frame}
                        onChange={(v) => setFrame(v as "device" | "bare")}
                        options={[
                            ["device", "Bezel", Phone01],
                            ["bare", "Screen", Monitor01],
                        ]}
                    />
                    <Segmented
                        label="Appearance"
                        value={state.appearance}
                        onChange={(v) => setAppearance(v as AppearanceMode)}
                        options={[
                            ["system", "System"],
                            ["light", "Light"],
                            ["dark", "Dark"],
                        ]}
                    />
                    <div className="flex gap-2">
                        <PanelButton icon={RefreshCcw01} onClick={reset} className="flex-1 justify-center">
                            Reset
                        </PanelButton>
                        <a
                            href={STORYBOOK_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-primary transition duration-100 ease-linear ring-inset hover:bg-primary_hover"
                        >
                            Storybook
                            <ArrowUpRight className="size-4" aria-hidden="true" />
                        </a>
                    </div>
                    <p className="text-xs text-quaternary">State is saved in this browser. On an iPhone, open this page and Add to Home Screen to run it full-screen.</p>
                </div>
            </aside>

            <FitStage frame={frame}>
                <IPhoneFrame variant={frame} dark={dark} statusBar={dark ? "light" : "dark"}>
                    {app}
                </IPhoneFrame>
            </FitStage>
        </div>
    );
};

const normalize = (hash: string) => {
    // "#/home" and "#/home/" and a tab root all mean the same screen.
    const h = hash.replace(/\/$/, "");
    for (const [tab, root] of Object.entries(TAB_ROOTS)) if (h === `#/${tab}/${root}`) return `#/${tab}`;
    return h;
};

const FitStage = ({ frame, children }: { frame: "device" | "bare"; children: ReactNode }) => {
    const w = frame === "device" ? IPHONE_17.width + 26 : IPHONE_17.width;
    const h = frame === "device" ? IPHONE_17.height + 26 : IPHONE_17.height;
    const { ref, scale } = useFitScale(w, h);
    return (
        <main ref={ref} className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
            <div style={{ width: w * scale, height: h * scale }}>
                <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
            </div>
        </main>
    );
};

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
