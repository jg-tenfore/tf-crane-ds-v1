import { useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import { ChevronRight, Menu01, ShoppingCart01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { CountBadge } from "@/components/base/badge";
import { useSafeArea } from "@/components/device/iphone-frame";
import type { ClubProfile } from "@/data/club-profiles";
import { courseById, type Course } from "@/data/crane";
import { courseBrandFor } from "@/screens/chrome/course-brands";
import { CourseLogo } from "@/screens/chrome/course-logo";
import type { DefaultPhotoSetId } from "@/screens/web/instruction/data/default-art";
import { cx } from "@/utils/cx";
import {
    DEFAULT_HERO_FOCUS,
    HERO_SIZE,
    heroFallbackPhotos,
    heroQuality,
    objectPosition,
    useHeroScrim,
    useImageSize,
    type HeroFocus,
} from "./hero-guardrails";

/* ------------------------------------------------------------------ */
/* Shared bits (also used by ClubHomeScreen's collapsed bar)           */
/* ------------------------------------------------------------------ */

/** The club's name on the home: the profile's display name, else the course name. */
export const clubName = (profile: ClubProfile, course: Course = courseById(profile.courseId)) => profile.displayName ?? course.name;

/**
 * The course-like object to draw the club's logo from. An organization logo (`logoOrg`, e.g. the MCG mark)
 * wins over the course's own (Falls Road). Tied to `logoOrg`, not the display name, so a rename keeps it.
 */
const logoCourseFor = (profile: ClubProfile, course: Course): Course => {
    const org = profile.logoOrg ? courseBrandFor(profile.logoOrg) : undefined;
    return org ? { ...course, id: org.id, name: profile.logoOrg!, shortName: profile.logoOrg! } : course;
};

/** The club's logo on a white tile (the one thing a course's logo is always shown on). */
export const ClubLogo = ({ profile, course, size = 52, className }: { profile: ClubProfile; course?: Course; size?: number; className?: string }) => (
    <CourseLogo course={logoCourseFor(profile, course ?? courseById(profile.courseId))} size={size} className={cx("rounded-xl bg-white shadow-ios-card ring-1 ring-black/5", className)} />
);

export interface HeroActionButtonProps {
    icon: FC<{ className?: string }>;
    "aria-label": string;
    onPress?: () => void;
    /** On the collapsed brand bar: a quiet white-on-brand button instead of glass. */
    onBrand?: boolean;
    /** Optional text after the icon (turns the circle into a capsule). */
    children?: ReactNode;
    badge?: number;
}

/** A Liquid Glass circle (or capsule) over the hero photo; white-on-brand once the bar collapses. */
export const HeroActionButton = ({ icon: Icon, onPress, onBrand, children, badge = 0, ...props }: HeroActionButtonProps) => (
    <AriaButton
        aria-label={props["aria-label"]}
        onPress={onPress}
        className={cx(
            "press-scale relative inline-flex h-[44px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full outline-none transition-colors duration-200 ease-linear focus-visible:ring-4 focus-visible:ring-white/60",
            children ? "max-w-[150px] pr-4 pl-3 text-ios-subheadline font-semibold" : "w-[44px]",
            onBrand ? "bg-white/15 text-white" : "glass text-primary",
        )}
    >
        <Icon className="size-[22px] shrink-0" aria-hidden="true" />
        {children && <span className="truncate">{children}</span>}
        {badge > 0 && <CountBadge count={badge} className="absolute -top-0.5 -right-0.5 h-[18px] min-w-[18px] text-[11px]" />}
    </AriaButton>
);

/* ------------------------------------------------------------------ */
/* ClubHomeHeader                                                      */
/* ------------------------------------------------------------------ */

export interface ClubHomeHeaderProps {
    profile: ClubProfile;
    /** The course whose tee sheet is showing (defaults to the profile's course). */
    course?: Course;
    /** Override the profile's photo (Buck's live preview). `null` previews "no photo". */
    heroPhoto?: string | null;
    /** Override the profile's focus point. */
    heroFocus?: HeroFocus;
    /** The photo's pixel width, if known (Buck knows it at upload). Measured from the image otherwise. */
    heroWidth?: number;
    /** The default set used when there's no photo (TenFore's Overcast classic until the org picks one). */
    photoSet?: DefaultPhotoSetId;
    /** Crossfade the default photos when there's no photo. Off for reduced motion. */
    animateFallback?: boolean;
    /** Draw the menu and cart buttons on the photo. ClubHomeScreen floats its own (they stay put on scroll). */
    showActions?: boolean;
    /** Show the current course's name on the menu button (orgs with several courses, like MCG). */
    showCourseOnMenu?: boolean;
    cartCount?: number;
    /** Opens My locations (the course switcher). */
    onMenu?: () => void;
    onCart?: () => void;
    /** Pressing the name opens course info (phone, email, address). */
    onCourseInfo?: () => void;
    className?: string;
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * ClubHomeHeader: the club home's hero. One full-bleed photo with the club's logo, name and tagline on
 * top. The course only supplies the photo (and a focus point); the guardrails are built in:
 * the photo is cropped to the header at the focus point, a dark scrim measured from the photo keeps white
 * text readable, and without a photo the default set crossfades in (never a TenFore logo).
 */
export const ClubHomeHeader = ({
    profile,
    course: courseProp,
    heroPhoto,
    heroFocus,
    heroWidth,
    photoSet,
    animateFallback = true,
    showActions = true,
    showCourseOnMenu,
    cartCount = 0,
    onMenu,
    onCart,
    onCourseInfo,
    className,
}: ClubHomeHeaderProps) => {
    const course = courseProp ?? courseById(profile.courseId);
    const { top: safeTop } = useSafeArea();
    const own = heroPhoto === null ? undefined : (heroPhoto ?? profile.heroPhoto);
    const photos = useMemo(() => (own ? [own] : heroFallbackPhotos(photoSet)), [own, photoSet]);
    const focus = own ? (heroFocus ?? profile.heroFocus ?? DEFAULT_HERO_FOCUS) : DEFAULT_HERO_FOCUS;

    const [index, setIndex] = useState(0);
    useEffect(() => {
        setIndex(0);
        if (!animateFallback || photos.length < 2 || prefersReducedMotion()) return;
        const t = setInterval(() => setIndex((n) => (n + 1) % photos.length), 6000);
        return () => clearInterval(t);
    }, [photos, animateFallback]);
    const current = photos[index % photos.length];

    const scrim = useHeroScrim(current, focus);
    const measured = useImageSize(own);
    const quality = heroQuality(heroWidth ?? measured?.width, heroWidth ? undefined : measured?.height);
    const name = clubName(profile, course);

    return (
        <header
            data-club-hero
            data-hero-source={own ? "club" : "default-set"}
            data-hero-quality={own ? quality.level : undefined}
            data-scrim={scrim.text.toFixed(2)}
            data-scrim-luminance={scrim.luminance?.toFixed(3)}
            className={cx("relative isolate shrink-0 overflow-hidden bg-brand-solid", className)}
            style={{ height: HERO_SIZE.height }}
        >
            {photos.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    draggable={false}
                    className={cx(
                        "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-linear",
                        i === index % photos.length ? "opacity-100" : "opacity-0",
                    )}
                    style={{ objectPosition: objectPosition(focus) }}
                />
            ))}

            {/* Always-on scrims; strength measured from the photo (see useHeroScrim). */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-black to-transparent to-35% transition-opacity duration-500" style={{ opacity: scrim.top }} />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-20% via-black/60 via-45% to-black to-75% transition-opacity duration-500"
                style={{ opacity: scrim.text }}
            />

            {showActions && (
                <div className="absolute inset-x-0 top-0 flex h-[54px] items-center justify-between px-gutter" style={{ marginTop: safeTop - 8 }}>
                    <HeroActionButton icon={Menu01} aria-label={`My locations, ${course.shortName}`} onPress={onMenu}>
                        {showCourseOnMenu ? course.shortName : undefined}
                    </HeroActionButton>
                    <HeroActionButton icon={ShoppingCart01} aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"} onPress={onCart} badge={cartCount} />
                </div>
            )}

            <AriaButton
                onPress={onCourseInfo}
                aria-label={`${name} course info`}
                className="group absolute inset-x-0 bottom-0 flex cursor-pointer items-center gap-3 px-gutter pt-3 pb-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-inset"
            >
                <ClubLogo profile={profile} course={course} />
                <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-ios-title2 leading-tight font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.35)]">{name}</span>
                    {profile.tagline && (
                        <span className="mt-0.5 block truncate text-ios-subheadline font-medium text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">{profile.tagline}</span>
                    )}
                </span>
                <ChevronRight className="size-5 shrink-0 text-white transition duration-100 ease-linear group-data-[pressed]:translate-x-0.5" aria-hidden="true" />
            </AriaButton>
        </header>
    );
};
