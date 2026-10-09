/**
 * Pieces shared by the Sign in ∕ Sign up screens. Composed locally (not in
 * components/) because they're specific to the auth flow: social sign-in glyphs,
 * the "or" divider, the large-title header, the terms checkbox, the password
 * requirement checklist and a footer that fades content scrolling underneath it.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import { Check } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";

/* ------------------------------------------------------------------ glyphs */

/** Apple logo, single colour (inherits currentColor). */
export const AppleGlyph = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M16.37 12.73c-.02-2.37 1.94-3.51 2.03-3.57-1.1-1.62-2.83-1.84-3.44-1.86-1.46-.15-2.86.86-3.6.86-.75 0-1.89-.84-3.11-.82-1.6.02-3.07.93-3.9 2.36-1.66 2.88-.42 7.15 1.2 9.49.79 1.14 1.73 2.43 2.97 2.38 1.19-.05 1.64-.77 3.08-.77 1.44 0 1.84.77 3.1.75 1.28-.02 2.09-1.16 2.88-2.31.9-1.33 1.28-2.61 1.3-2.68-.03-.01-2.49-.96-2.51-3.83ZM14.02 5.76c.66-.8 1.1-1.9.98-3.01-.95.04-2.1.63-2.78 1.43-.61.7-1.14 1.83-1 2.91 1.06.08 2.14-.54 2.8-1.33Z" />
    </svg>
);

/** Google "G", in Google's four brand colours (third-party logo, so literal fills). */
export const GoogleGlyph = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path
            fill="#FBBC05"
            d="M43.61 20.08H42V20H24v8h11.3c-1.65 4.66-6.08 8-11.3 8-6.63 0-12-5.37-12-12s5.37-12 12-12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.34-.14-2.65-.39-3.92Z"
        />
        <path fill="#EA4335" d="m6.31 14.69 6.57 4.82C14.66 15.11 18.96 12 24 12c3.06 0 5.84 1.15 7.96 3.04l5.66-5.66C34.05 6.05 29.27 4 24 4 16.32 4 9.66 8.34 6.31 14.69Z" />
        <path fill="#34A853" d="M24 44c5.17 0 9.86-1.98 13.41-5.19l-6.19-5.24A11.9 11.9 0 0 1 24 36c-5.2 0-9.62-3.32-11.28-7.95l-6.52 5.03C9.5 39.56 16.23 44 24 44Z" />
        <path fill="#4285F4" d="M43.61 20.08H42V20H24v8h11.3a12.04 12.04 0 0 1-4.09 5.57l6.19 5.24C36.97 39.21 44 34 44 24c0-1.34-.14-2.65-.39-3.92Z" />
    </svg>
);

/* ---------------------------------------------------------------- layout */

/** Large-title header for auth screens: iOS Large Title + one line of supporting copy. */
export const AuthTitle = ({ title, subtitle, className }: { title: ReactNode; subtitle?: ReactNode; className?: string }) => (
    <header className={cx("px-gutter", className)}>
        <h1 className="text-ios-large-title text-primary">{title}</h1>
        {subtitle && <p className="mt-1.5 text-ios-body text-tertiary">{subtitle}</p>}
    </header>
);

/** Hairline — "or" — hairline, between email and social sign-in. */
export const OrDivider = ({ label = "or", className }: { label?: string; className?: string }) => (
    <div role="separator" aria-label={label} className={cx("flex items-center gap-3", className)}>
        <span className="h-px flex-1 bg-border-primary" />
        <span className="text-ios-footnote text-quaternary">{label}</span>
        <span className="h-px flex-1 bg-border-primary" />
    </div>
);

/**
 * Wraps `Screen footer` content with a fade so fields scrolling under the pinned
 * button don't collide with it. The fade extends past the footer's padding down
 * through the home-indicator area.
 */
export const AuthFooter = ({ children, surface = "grouped" }: { children: ReactNode; surface?: "grouped" | "plain" }) => (
    <div className="relative">
        <div
            aria-hidden="true"
            className={cx(
                "pointer-events-none absolute -inset-x-4 -top-8 -bottom-[46px] -z-10 bg-linear-to-t from-60% to-transparent",
                surface === "grouped" ? "from-bg-secondary" : "from-bg-primary",
            )}
        />
        {children}
    </div>
);

/* --------------------------------------------------------------- actions */

export interface SocialButtonsProps {
    /** "Continue" on Welcome, "Sign in" on Sign In. */
    verb?: string;
    onApple?: () => void;
    onGoogle?: () => void;
    className?: string;
}

/** Sign in with Apple (black, white in dark mode — per Apple's HIG) + Google (outline). */
export const SocialButtons = ({ verb = "Continue", onApple, onGoogle, className }: SocialButtonsProps) => (
    <div className={cx("flex flex-col gap-3", className)}>
        <Button color="black" fullWidth iconLeading={AppleGlyph} onPress={onApple} className="dark:bg-white dark:text-black">
            {verb} with Apple
        </Button>
        <Button color="outline" fullWidth iconLeading={GoogleGlyph} onPress={onGoogle} className="text-primary">
            {verb} with Google
        </Button>
    </div>
);

/* ----------------------------------------------------------------- forms */

export interface TermsCheckboxProps {
    isSelected: boolean;
    onChange: (selected: boolean) => void;
    className?: string;
}

/** "I agree to the Terms and Privacy Policy" — React Aria Checkbox with an iOS-style rounded box. */
export const TermsCheckbox = ({ isSelected, onChange, className }: TermsCheckboxProps) => (
    <AriaCheckbox
        isSelected={isSelected}
        onChange={onChange}
        className={cx("group flex cursor-pointer items-start gap-3 rounded-ios-control py-1 outline-none", className)}
    >
        <span
            className={cx(
                "mt-px flex size-[22px] shrink-0 items-center justify-center rounded-[7px] bg-primary ring-1 ring-primary transition duration-100 ease-linear ring-inset",
                "group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0",
                "group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60",
            )}
        >
            <Check className="size-4 text-white opacity-0 group-data-[selected]:opacity-100" strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="text-ios-subheadline text-secondary">
            I agree to the <span className="font-semibold text-brand-secondary">Terms of Service</span> and{" "}
            <span className="font-semibold text-brand-secondary">Privacy Policy</span>
        </span>
    </AriaCheckbox>
);

export const PASSWORD_RULES = [
    { id: "length", label: "8+ characters", test: (p: string) => p.length >= 8 },
    { id: "number", label: "A number", test: (p: string) => /\d/.test(p) },
    { id: "letter", label: "A letter", test: (p: string) => /[a-z]/i.test(p) },
] as const;

export const isPasswordValid = (p: string) => PASSWORD_RULES.every((r) => r.test(p));

/** Live password requirements. Each rule's check fills green as it's met. */
export const PasswordChecklist = ({ password, className }: { password: string; className?: string }) => (
    <ul aria-label="Password requirements" className={cx("flex flex-wrap gap-x-4 gap-y-1.5 px-0.5", className)}>
        {PASSWORD_RULES.map((r) => {
            const met = r.test(password);
            return (
                <li key={r.id} className="flex items-center gap-1.5">
                    <span
                        className={cx(
                            "flex size-4 items-center justify-center rounded-full transition duration-100 ease-linear",
                            met ? "bg-brand-solid text-white" : "text-fg-quaternary ring-1 ring-primary ring-inset",
                        )}
                    >
                        <Check className={cx("size-3", !met && "opacity-0")} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className={cx("text-ios-footnote", met ? "text-secondary" : "text-tertiary")}>
                        {r.label}
                        <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
                    </span>
                </li>
            );
        })}
    </ul>
);

/* ----------------------------------------------------------------- hooks */

/**
 * Simulated network request: flips `isLoading` on, waits `ms`, then runs the callback.
 * Timers are cleared on unmount so a story/screen change mid-request is safe.
 */
export const useFakeRequest = (ms = 900) => {
    const [isLoading, setLoading] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => () => clearTimeout(timer.current), []);
    const run = useCallback(
        (done: () => void) => {
            setLoading(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => {
                setLoading(false);
                done();
            }, ms);
        },
        [ms],
    );
    return { isLoading, run };
};

/** Seconds-remaining countdown, e.g. "Resend code in 0:24". `restart()` starts it over. */
export const useCountdown = (seconds: number) => {
    const [left, setLeft] = useState(seconds);
    useEffect(() => {
        if (left <= 0) return;
        const t = setTimeout(() => setLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [left]);
    const restart = useCallback(() => setLeft(seconds), [seconds]);
    return { left, restart };
};

export const formatSeconds = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
