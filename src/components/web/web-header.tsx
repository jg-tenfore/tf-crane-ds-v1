import {
  ArrowRight,
  ChevronDown,
  Menu01,
  MarkerPin01,
  ShoppingBag01,
} from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import type { Course } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { hasCourseBrand } from "@/screens/chrome/course-brands";
import { WebLink } from "./web-router";
import { RevealRow } from "./reveal-row";

export type WebSection =
  | "tee-times"
  | "shop"
  | "activities"
  | "clinics"
  | "leagues"
  | "restaurant"
  | "events"
  | "calendar";

/** CraneWeb's section nav, in production order. `short` is the mobile-web tab label. */
export const WEB_SECTIONS: {
  id: WebSection;
  label: string;
  short: string;
  href: string;
}[] = [
  { id: "tee-times", label: "Tee Times", short: "Tee", href: "/tee-times" },
  { id: "shop", label: "Shop", short: "Store", href: "/shop" },
  {
    id: "activities",
    label: "Activities",
    short: "Activities",
    href: "/activities",
  },
  { id: "clinics", label: "Clinics", short: "Clinics", href: "/clinics" },
  { id: "leagues", label: "Leagues", short: "Leagues", href: "/leagues" },
  {
    id: "restaurant",
    label: "Restaurant",
    short: "Restaurant",
    href: "/restaurant",
  },
  { id: "events", label: "Events", short: "Events", href: "/events" },
  { id: "calendar", label: "Calendar", short: "Calendar", href: "/calendar" },
];

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export interface WebHeaderProps {
  course: Course;
  active?: WebSection;
  cartCount?: number;
  cartTotal?: number;
  /** Signed-in first name; omit for the guest header ("Sign in"). */
  userName?: string;
  onCourse?: () => void;
  onSignIn?: () => void;
  onAccount?: () => void;
}

const focus =
  "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

const Cart = ({ count, total }: { count: number; total: number }) => (
  <WebLink
    href="/cart"
    aria-label={`Cart, ${count} items, ${money(total)}`}
    className={cx(
      "flex items-center gap-2 rounded-lg px-1.5 py-1 text-primary",
      focus,
    )}
  >
    <span className="relative">
      <ShoppingBag01 className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-solid px-1 text-[10px] leading-none font-semibold text-white">
          {count}
        </span>
      )}
    </span>
    <span className="text-sm font-semibold tabular-nums">{money(total)}</span>
  </WebLink>
);

/**
 * WebHeader — CraneWeb's plain white chrome (no glass on web).
 * Desktop: utility row (location · cart · account) over the course switcher + uppercase
 * section nav. Tablet: nav drops to its own scrolling row. Mobile web: the native layout —
 * menu · course · cart, with sentence-case section tabs.
 */
export const WebHeader = ({
  course,
  active,
  cartCount = 0,
  cartTotal = 0,
  userName,
  onCourse,
  onSignIn,
  onAccount,
}: WebHeaderProps) => (
  <header className="sticky top-0 z-30 bg-primary">
    {/* Utility row — tablet and up */}
    <div className="hidden border-b border-secondary @tablet:block">
      <div className="mx-auto flex h-11 max-w-web items-center justify-between px-8">
        <span className="flex items-center gap-1.5 text-sm text-secondary">
          <MarkerPin01
            className="size-4 text-fg-quaternary"
            aria-hidden="true"
          />
          {course.city}, {course.state}
        </span>
        <div className="flex items-center gap-4">
          <Cart count={cartCount} total={cartTotal} />
          <span className="h-5 w-px bg-border-secondary" aria-hidden="true" />
          {userName ? (
            <AriaButton
              onPress={onAccount}
              className={cx(
                "cursor-pointer rounded-lg px-1.5 py-1 text-sm font-semibold text-primary",
                focus,
              )}
            >
              {userName}
            </AriaButton>
          ) : (
            <AriaButton
              onPress={onSignIn}
              className={cx(
                "caps flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-brand-secondary ring-1 ring-brand ring-inset transition duration-100 ease-linear hover:bg-brand-primary_alt",
                focus,
              )}
            >
              Sign in <ArrowRight className="size-3.5" aria-hidden="true" />
            </AriaButton>
          )}
        </div>
      </div>
    </div>

    {/* Main row */}
    <div className="border-b border-secondary">
      <div className="mx-auto flex h-16 max-w-web items-center gap-3 px-4 @tablet:h-[72px] @tablet:px-8">
        {/* Mobile: menu button */}
        <AriaButton
          aria-label="Golf courses"
          onPress={onCourse}
          className={cx(
            "flex size-10 cursor-pointer items-center justify-center rounded-full text-primary @tablet:hidden",
            focus,
          )}
        >
          <Menu01 className="size-6" aria-hidden="true" />
        </AriaButton>

        {/* Course switcher */}
        <AriaButton
          onPress={onCourse}
          aria-label={`${course.name}, change course`}
          className={cx(
            "flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-lg py-1 @tablet:flex-initial @tablet:justify-start",
            focus,
          )}
        >
          {/* Real club logos show at every width; initials placeholders only from tablet up. */}
          <CourseLogo
            course={course}
            size={36}
            className={cx(
              hasCourseBrand(course)
                ? "rounded-lg"
                : "hidden rounded-full @tablet:inline-flex",
            )}
          />
          <span className="flex min-w-0 flex-col items-center @tablet:items-start">
            <span className="flex max-w-full items-center gap-1.5">
              <span className="truncate text-md font-semibold tracking-[-0.2px] text-primary @tablet:text-xl @tablet:tracking-[-0.3px]">
                {course.name}
              </span>
              <ChevronDown
                className="hidden size-4 shrink-0 text-fg-tertiary @tablet:block"
                aria-hidden="true"
              />
            </span>
            <span className="text-xs text-tertiary @tablet:hidden">
              {course.city}
            </span>
          </span>
        </AriaButton>

        {/* Desktop nav */}
        <nav
          aria-label="Sections"
          className="ml-auto hidden shrink-0 items-center gap-4 @desktop:flex @wide:gap-7"
        >
          {WEB_SECTIONS.map((s) => {
            const on = s.id === active;
            return (
              <WebLink
                key={s.id}
                href={s.href}
                aria-current={on ? "page" : undefined}
                className={cx(
                  "caps relative py-2 whitespace-nowrap transition duration-100 ease-linear",
                  on
                    ? "text-brand-secondary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-fg-brand-primary"
                    : "text-secondary hover:text-primary",
                  focus,
                )}
              >
                {s.label}
              </WebLink>
            );
          })}
        </nav>

        {/* Mobile: cart icon */}
        <span className="@tablet:hidden">
          <WebLink
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className={cx(
              "relative flex size-10 items-center justify-center rounded-full text-primary",
              focus,
            )}
          >
            <ShoppingBag01 className="size-6" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error-solid px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </WebLink>
        </span>
      </div>
    </div>

    {/* Tablet & mobile: section tabs */}
    <RevealRow
      label="Sections"
      current={active}
      className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-secondary px-2 @tablet:px-6 @desktop:hidden"
    >
      {WEB_SECTIONS.map((s) => {
        const on = s.id === active;
        return (
          <WebLink
            key={s.id}
            href={s.href}
            aria-current={on ? "page" : undefined}
            className={cx(
              "relative flex h-11 shrink-0 items-center px-3 whitespace-nowrap transition duration-100 ease-linear",
              "text-md @tablet:caps",
              on
                ? "font-medium text-brand-secondary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-fg-brand-primary"
                : "text-quaternary",
              focus,
            )}
          >
            <span className="@tablet:hidden">{s.short}</span>
            <span className="hidden @tablet:inline">{s.label}</span>
          </WebLink>
        );
      })}
    </RevealRow>
  </header>
);
