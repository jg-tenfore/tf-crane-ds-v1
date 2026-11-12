/**
 * Pieces shared by the Crane Web Sign in ∕ Sign up pages. Composed locally (not in
 * components/web/) because they're specific to the auth flow: the split course/brand
 * layout, the Sign up | Log in switch, web-sized checkbox + password checklist, and
 * query-string helpers for `?next=` / `?email=`.
 *
 * Logic (password rules, fake request, countdown, email check) and the Apple/Google
 * glyphs are reused from the Crane mobile auth flow (`src/screens/auth/auth-parts.tsx`).
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type FC,
  type ReactNode,
} from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import {
  CalendarCheck01,
  Check,
  Flag01,
  ShoppingBag01,
  Wallet02,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { CraneAppIcon } from "@/components/foundations/logos";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import type { Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import {
  AppleGlyph,
  GoogleGlyph,
  PASSWORD_RULES,
} from "@/screens/auth/auth-parts";
import { useWebSession, WebShell } from "@/screens/web/web-shell";
import goldenHour from "./images/sign-in-golden-hour.webp";
import green from "./images/sign-in-green.webp";
import mist from "./images/sign-in-mist.webp";

/**
 * Brand-panel photography (Higgsfield, from Sagamore course references), portrait 2:3 at
 * 1000px. `mist` is the default; the others are kept as options for review.
 */
export const AUTH_BACKGROUNDS = {
  mist,
  "golden-hour": goldenHour,
  green,
} as const;
export type AuthBackground = keyof typeof AUTH_BACKGROUNDS;
/** Lets stories (and later a course setting) pick the brand-panel photo. */
export const AuthBackgroundContext = createContext<AuthBackground>("mist");

export {
  formatSeconds,
  isEmail,
  isPasswordValid,
  useCountdown,
  useFakeRequest,
} from "@/screens/auth/auth-parts";

/* ------------------------------------------------------------ query string */

/** Query params of the current web route ("/verify-email?email=…&next=/checkout"). */
export const useQuery = () => {
  const { path } = useWebRouter();
  return new URLSearchParams(path.split("?")[1] ?? "");
};

/** Build "/path?a=1&b=2", dropping empty values. */
export const withQuery = (
  path: string,
  params: Record<string, string | null | undefined>,
) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
};

/** Where to go once signed in: `?next=` if it's an in-app path, else /account. */
export const useNextPath = () => {
  const next = useQuery().get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
};

/** Scroll the web frame back to the top when a page mounts (each route is a fresh page). */
export const useScrollTopOnMount = () => {
  const { scrollToTop } = useWebFrame();
  const ref = useRef(scrollToTop);
  useEffect(() => {
    ref.current();
  }, []);
};

/* ------------------------------------------------------------ brand panel */

const BENEFITS: { icon: FC<{ className?: string }>; label: string }[] = [
  { icon: CalendarCheck01, label: "Book and manage your tee times" },
  { icon: ShoppingBag01, label: "Shop the pro shop online" },
  {
    icon: Wallet02,
    label: "Punch cards, rain checks and gift cards in one place",
  },
  { icon: Flag01, label: "One login for every TenFore course" },
];

/** Left half of the desktop split: the course you're signing in to, and why. */
export const AuthBrandPanel = ({
  course,
  eyebrow = "Your account at",
  className,
}: {
  course: Course;
  eyebrow?: string;
  className?: string;
}) => {
  const background = AUTH_BACKGROUNDS[useContext(AuthBackgroundContext)];
  return (
    <aside
      className={cx(
        "relative isolate flex-col justify-between gap-12 overflow-hidden bg-brand-section p-10 @desktop:p-12",
        className,
      )}
    >
      {/* Course photo under a deep-green wash: lighter at the top, solid behind the footer so the copy stays readable. */}
      <img
        src={background}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 size-full object-cover"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,42,27,0.3) 0%, rgba(15,42,27,0.55) 40%, rgba(15,42,27,0.9) 100%)",
        }}
      />
      <div>
        <CourseLogo
          course={course}
          size={56}
          className="rounded-xl bg-primary ring-0"
        />
        <div className="caps mt-8 text-tertiary_on-brand">{eyebrow}</div>
        <h2 className="mt-2 text-display-sm font-semibold tracking-[-0.5px] text-primary_on-brand">
          {course.name}
        </h2>
        <p className="mt-3 max-w-[400px] text-lg text-secondary_on-brand">
          Book tee times, shop the pro shop and manage your account.
        </p>
        <ul className="mt-9 flex flex-col gap-4">
          {BENEFITS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 text-md text-primary_on-brand"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon
                  className="size-[18px] text-fg-white"
                  aria-hidden="true"
                />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-3 border-t border-white/15 pt-6">
        <CraneAppIcon size={40} />
        <div>
          <div className="text-sm font-semibold text-primary_on-brand">
            Same account as the Crane app
          </div>
          <div className="text-sm text-tertiary_on-brand">
            Powered by TenFore Golf
          </div>
        </div>
      </div>
    </aside>
  );
};

/* ----------------------------------------------------------------- layout */

export interface AuthLayoutProps {
  children: ReactNode;
  /** Show the course/brand panel on desktop (≥1024). */
  panel?: boolean;
  panelEyebrow?: string;
}

/**
 * AuthLayout — WebShell header (course context) without the footer, then one card.
 * Desktop/laptop: split card, brand panel left + form right. Tablet & mobile web: the
 * form card alone (the course logo moves into the form heading).
 */
export const AuthLayout = ({
  children,
  panel = true,
  panelEyebrow,
}: AuthLayoutProps) => {
  const { course } = useWebSession();
  useScrollTopOnMount();

  return (
    <WebShell footer={false}>
      <main className="mx-auto w-full max-w-web-content px-4 pt-5 pb-12 @tablet:px-8 @tablet:pt-12 @tablet:pb-20">
        <div
          className={cx(
            "mx-auto max-w-[520px] overflow-hidden rounded-2xl bg-primary ring-1 ring-secondary ring-inset",
            panel &&
              "@desktop:grid @desktop:max-w-none @desktop:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]",
          )}
        >
          {panel && (
            <AuthBrandPanel
              course={course}
              eyebrow={panelEyebrow}
              className="hidden @desktop:flex"
            />
          )}
          <div className="flex flex-col justify-center px-5 py-8 @tablet:px-10 @tablet:py-11 @desktop:px-14 @desktop:py-14">
            <div className="mx-auto w-full max-w-[420px]">{children}</div>
          </div>
        </div>
      </main>
    </WebShell>
  );
};

export interface AuthHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Featured icon above the title (verify, reset). Without one, the course logo shows below desktop. */
  icon?: FC<{ className?: string }>;
  tone?: "brand" | "success";
  align?: "left" | "center";
  className?: string;
}

/** Form title block. Below desktop the brand panel is hidden, so the course logo leads instead. */
export const AuthHeading = ({
  title,
  subtitle,
  icon: Icon,
  tone = "brand",
  align = "left",
  className,
}: AuthHeadingProps) => {
  const { course } = useWebSession();
  return (
    <header
      className={cx(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {Icon ? (
        <span
          className={cx(
            "mb-6 flex size-14 items-center justify-center rounded-full",
            tone === "success"
              ? "bg-brand-solid text-white"
              : "bg-brand-primary_alt text-fg-brand-primary",
          )}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
      ) : (
        <CourseLogo
          course={course}
          size={48}
          className="mb-6 rounded-xl @desktop:hidden"
        />
      )}
      <h1 className="text-display-xs font-semibold tracking-[-0.3px] text-primary @tablet:text-display-sm">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-md text-tertiary">{subtitle}</p>}
    </header>
  );
};

/* ---------------------------------------------------------------- controls */

/**
 * Sign up | Log in switch (Fox's segmented "button-border" tabs). Each half is a real
 * link to /sign-up or /sign-in, carrying `?next=` across.
 */
export const AuthModeSwitch = ({
  mode,
  className,
}: {
  mode: "sign-in" | "sign-up";
  className?: string;
}) => {
  const next = useNextPath();
  const tabs = [
    { id: "sign-up", label: "Sign up", href: withQuery("/sign-up", { next }) },
    { id: "sign-in", label: "Log in", href: withQuery("/sign-in", { next }) },
  ];
  return (
    <nav
      aria-label="Sign up or log in"
      className={cx(
        "grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 ring-1 ring-secondary ring-inset",
        className,
      )}
    >
      {tabs.map((t) => {
        const on = t.id === mode;
        return (
          <WebLink
            key={t.id}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cx(
              "flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition duration-100 ease-linear outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60",
              on
                ? "bg-primary text-primary shadow-xs ring-1 ring-secondary ring-inset"
                : "text-quaternary hover:text-secondary",
            )}
          >
            {t.label}
          </WebLink>
        );
      })}
    </nav>
  );
};

/** Inline green text link ("Forgot password?", "Back to log in"). */
export const AuthLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => (
  <WebLink
    href={href}
    className={cx(
      "inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-brand-secondary outline-none hover:underline focus-visible:ring-4 focus-visible:ring-brand-300/60",
      className,
    )}
  >
    {children}
  </WebLink>
);

/** "Or continue with" + Google / Apple, side by side (Fox's social group, labelled for web). */
export const SocialSignIn = ({
  label = "Or continue with",
  onPress,
  className,
}: {
  label?: string;
  onPress?: () => void;
  className?: string;
}) => (
  <div className={cx("flex flex-col gap-4", className)}>
    <div
      role="separator"
      aria-label={label}
      className="flex items-center gap-3"
    >
      <span className="h-px flex-1 bg-border-secondary" />
      <span className="text-sm text-tertiary">{label}</span>
      <span className="h-px flex-1 bg-border-secondary" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Button
        color="outline"
        size="md"
        iconLeading={GoogleGlyph}
        onPress={onPress}
        className="h-11 rounded-lg text-md text-secondary"
      >
        Google
      </Button>
      <Button
        color="outline"
        size="md"
        iconLeading={AppleGlyph}
        onPress={onPress}
        className="h-11 rounded-lg text-md text-secondary"
      >
        Apple
      </Button>
    </div>
  </div>
);

/** Web-sized checkbox ("Remember me", terms). React Aria Checkbox. */
export const WebCheckbox = ({
  isSelected,
  onChange,
  children,
  className,
}: {
  isSelected: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
  className?: string;
}) => (
  <AriaCheckbox
    isSelected={isSelected}
    onChange={onChange}
    className={cx(
      "group flex cursor-pointer items-start gap-2.5 outline-none",
      className,
    )}
  >
    <span
      className={cx(
        "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-primary ring-1 ring-primary transition duration-100 ease-linear ring-inset",
        "group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0",
        "group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60",
      )}
    >
      <Check
        className="size-3.5 text-white opacity-0 group-data-[selected]:opacity-100"
        strokeWidth={3}
        aria-hidden="true"
      />
    </span>
    <span className="text-sm text-secondary">{children}</span>
  </AriaCheckbox>
);

/** Live password requirements (same rules as the app); each tick fills green as it's met. */
export const WebPasswordChecklist = ({
  password,
  className,
}: {
  password: string;
  className?: string;
}) => (
  <ul
    aria-label="Password requirements"
    className={cx("flex flex-wrap gap-x-5 gap-y-1.5", className)}
  >
    {PASSWORD_RULES.map((r) => {
      const met = r.test(password);
      return (
        <li key={r.id} className="flex items-center gap-1.5">
          <span
            className={cx(
              "flex size-4 items-center justify-center rounded-full transition duration-100 ease-linear",
              met
                ? "bg-brand-solid text-white"
                : "ring-1 ring-primary ring-inset",
            )}
          >
            <Check
              className={cx("size-3", !met && "opacity-0")}
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
          <span
            className={cx("text-sm", met ? "text-secondary" : "text-tertiary")}
          >
            {r.label}
            <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
          </span>
        </li>
      );
    })}
  </ul>
);

/** Primary submit button, web-shaped. */
export const authPrimary = "rounded-lg text-md";
