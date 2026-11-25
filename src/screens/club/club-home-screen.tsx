import { useMemo, useState } from "react";
import { Menu01, ShoppingBag01, ShoppingCart01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { useSafeArea } from "@/components/device/iphone-frame";
import { TAB_BAR_CHROME_HEIGHT, useScreenChrome } from "@/components/device/screen";
import { EmptyState } from "@/components/feedback/empty-state";
import { useToast } from "@/components/feedback/toast";
import { TeeTimeCard, type TeeTime } from "@/components/lists/tee-time-card";
import { DateStrip, buildDays } from "@/components/navigation/date-strip";
import { UnderlineTabs } from "@/components/navigation/underline-tabs";
import { useAppShell } from "@/components/prototype/app-shell";
import { useStack } from "@/components/prototype/stack-navigator";
import { clubProfileFor, type ClubProfile } from "@/data/club-profiles";
import { COURSE_SECTIONS, TODAY, teeSheet } from "@/data/crane";
import { useBookings } from "@/screens/bookings/bookings-store";
import { useCourse } from "@/screens/chrome/course-context";
import { ConfigureBookingSheet } from "@/screens/home/configure-booking-sheet";
import type { TeeSheetScreenProps } from "@/screens/home/tee-sheet-screen";
import type { DefaultPhotoSetId } from "@/screens/web/instruction/data/default-art";
import { cx } from "@/utils/cx";
import { ClubFeedStrip } from "./club-feed-strip";
import { ClubHomeHeader, ClubLogo, HeroActionButton, clubName } from "./club-home-header";
import { HERO_SIZE, type HeroFocus } from "./hero-guardrails";

export interface ClubHomeScreenProps extends TeeSheetScreenProps {
    /** Defaults to the profile for the current course. */
    profile?: ClubProfile;
    /** Override the profile's photo (Buck's live preview). `null` previews "no photo". */
    heroPhoto?: string | null;
    heroFocus?: HeroFocus;
    heroWidth?: number;
    photoSet?: DefaultPhotoSetId;
    animateFallback?: boolean;
}

/** Route names in the club stack (see clubScreens in club-app.tsx). */
export const CLUB_ROUTES = { home: "club-home", feed: "club-feed" } as const;

/**
 * ClubHomeScreen: the Home tab of a white-label Crane app. The club's hero (photo, logo, name, tagline),
 * its latest announcements, then the same tee sheet as the standard Home (section tabs, date strip,
 * tee times, Configure Booking). The hero scrolls away; the menu and cart stay put, and a brand-coloured
 * bar with the club's name fades in behind them while the section tabs and dates stick below it.
 */
export const ClubHomeScreen = ({
    profile,
    heroPhoto,
    heroFocus,
    heroWidth,
    photoSet,
    animateFallback,
    openTeeTimeIndex,
    bookingStep,
    cartCount = 0,
}: ClubHomeScreenProps) => {
    const { course, setDrawerOpen, setInfoOpen } = useCourse();
    const club = profile ?? clubProfileFor(course.id);
    const name = clubName(club, course);
    // Orgs with several courses (MCG) show which course the tee sheet is for on the menu button.
    const multiCourse = !!club.displayName && club.displayName !== course.name;
    const safe = useSafeArea();
    const { hasTabBar } = useScreenChrome();
    const barHeight = safe.top + 54;
    const stack = useStack();

    // Tee sheet: same parts and behaviour as TeeSheetScreen.
    const days = useMemo(() => buildDays(TODAY), []);
    const [day, setDay] = useState(days[0].id);
    const [section, setSection] = useState("tee");
    const sheet = useMemo(() => teeSheet(course), [course]);
    const [selected, setSelected] = useState<TeeTime | null>(openTeeTimeIndex != null ? sheet[openTeeTimeIndex] : null);
    const { addBooking } = useBookings();
    const toast = useToast();
    const shell = useAppShell();
    const dayLabel = new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    const [collapsed, setCollapsed] = useState(false);
    const collapseAt = HERO_SIZE.height - barHeight - 24;

    return (
        <>
            <div className="absolute inset-0 bg-secondary" data-club-home={club.courseId}>
                <div
                    className="scrollbar-hide h-full overflow-y-auto overscroll-contain"
                    style={{ paddingBottom: (hasTabBar ? TAB_BAR_CHROME_HEIGHT : safe.bottom) + 16 }}
                    onScroll={(e) => setCollapsed(e.currentTarget.scrollTop > collapseAt)}
                >
                    <ClubHomeHeader
                        profile={club}
                        course={course}
                        heroPhoto={heroPhoto}
                        heroFocus={heroFocus}
                        heroWidth={heroWidth}
                        photoSet={photoSet}
                        animateFallback={animateFallback}
                        showActions={false}
                        onCourseInfo={() => setInfoOpen(true)}
                    />

                    <ClubFeedStrip
                        feed={club.feed}
                        className="pt-4 pb-3"
                        onSeeAll={() => stack.push(CLUB_ROUTES.feed)}
                        onOpenPost={(p) => stack.push(CLUB_ROUTES.feed, { postId: p.id })}
                    />

                    <div className="sticky z-10" style={{ top: barHeight }}>
                        <UnderlineTabs aria-label="Course sections" layout="scroll" tabs={COURSE_SECTIONS} selectedId={section} onChange={setSection} />
                        {section === "tee" && <DateStrip days={days} selectedId={day} onChange={setDay} className="bg-secondary/85 backdrop-blur-xl" />}
                    </div>

                    {section === "tee" ? (
                        <div className="space-y-2.5 px-gutter pt-1">
                            {sheet.map((t) => (
                                <TeeTimeCard key={t.id} teeTime={t} onPress={setSelected} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={ShoppingBag01}
                            title={`${COURSE_SECTIONS.find((s) => s.id === section)?.label} coming soon`}
                            description="This section is part of the next round of screens."
                        />
                    )}
                </div>

                {/* Floating chrome: the menu and cart over the photo, and the collapsed brand bar once the hero scrolls away. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20" style={{ height: barHeight }}>
                    <div
                        aria-hidden="true"
                        className={cx(
                            "absolute inset-0 bg-brand-solid/95 shadow-[0_0.5px_0_rgb(0_0_0/0.12)] backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-200 ease-linear",
                            collapsed ? "pointer-events-auto opacity-100" : "opacity-0",
                        )}
                    />
                    <div className="pointer-events-auto relative flex h-[54px] items-center gap-2 px-gutter" style={{ marginTop: safe.top - 8 }}>
                        <HeroActionButton icon={Menu01} aria-label={`My locations, ${course.shortName}`} onPress={() => setDrawerOpen(true)} onBrand={collapsed}>
                            {/* Icon-only once collapsed, so the club name has room in the bar. */}
                            {multiCourse && !collapsed ? course.shortName : undefined}
                        </HeroActionButton>
                        <div className={cx("flex min-w-0 flex-1 justify-center transition-opacity duration-200 ease-linear", collapsed ? "opacity-100" : "pointer-events-none opacity-0")} inert={!collapsed}>
                            <AriaButton
                                onPress={() => setInfoOpen(true)}
                                aria-label={`${name} course info`}
                                className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                            >
                                <ClubLogo profile={club} course={course} size={28} className="rounded-md shadow-none" />
                                <span className="truncate text-ios-headline text-white">{name}</span>
                            </AriaButton>
                        </div>
                        <HeroActionButton icon={ShoppingCart01} aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"} badge={cartCount} onBrand={collapsed} />
                    </div>
                </div>
            </div>

            <ConfigureBookingSheet
                teeTime={selected}
                course={course}
                dateLabel={dayLabel}
                initialStep={bookingStep}
                onOpenChange={(o) => !o && setSelected(null)}
                onReserve={({ players, holes }) => {
                    if (!selected) return;
                    addBooking({ course, date: new Date(`${day}T12:00:00`), time: selected.time, players, holes, status: "upcoming" });
                    toast.show({ title: `Reserved ${selected.time} · ${course.shortName}`, action: { label: "View", onPress: () => shell.setTab("bookings") } });
                }}
            />
        </>
    );
};
