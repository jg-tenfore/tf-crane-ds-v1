import { useMemo, useState } from "react";
import { ShoppingBag01 } from "@untitledui/icons";
import { Screen, useNavChromeHeight } from "@/components/device/screen";
import { CourseHeader } from "@/components/navigation/course-header";
import { DateStrip, buildDays } from "@/components/navigation/date-strip";
import { UnderlineTabs } from "@/components/navigation/underline-tabs";
import { TeeTimeCard, type TeeTime } from "@/components/lists/tee-time-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { COURSE_SECTIONS, teeSheet } from "@/data/crane";
import { useCourse } from "@/screens/chrome/course-context";
import { useBookings } from "@/screens/bookings/bookings-store";
import { useToast } from "@/components/feedback/toast";
import { useAppShell } from "@/components/prototype/app-shell";
import { ConfigureBookingSheet } from "./configure-booking-sheet";

const TODAY = new Date(2026, 9, 9);

export interface TeeSheetScreenProps {
    /** Open the Configure Booking sheet on this tee time index (for stories). */
    openTeeTimeIndex?: number;
    bookingStep?: "configure" | "summary";
    cartCount?: number;
}

/**
 * Home — the course's tee sheet. Course header (drawer, course info, cart),
 * section tabs (Tee / Store / Activities / Clinics / Restaurant), a date strip,
 * then tee times. Tapping an open time opens Configure Booking.
 */
export const TeeSheetScreen = ({ openTeeTimeIndex, bookingStep, cartCount = 0 }: TeeSheetScreenProps) => {
    const { course, setDrawerOpen, setInfoOpen } = useCourse();
    const days = useMemo(() => buildDays(TODAY), []);
    const [day, setDay] = useState(days[0].id);
    const [section, setSection] = useState("tee");
    const sheet = useMemo(() => teeSheet(course), [course]);
    const [selected, setSelected] = useState<TeeTime | null>(openTeeTimeIndex != null ? sheet[openTeeTimeIndex] : null);
    const navHeight = useNavChromeHeight();
    const { addBooking } = useBookings();
    const toast = useToast();
    const shell = useAppShell();
    const dayLabel = new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    // Header + section tabs + date strip all float; content starts below them.
    const chrome = (
        <div>
            <CourseHeader
                courseName={course.name}
                city={course.city}
                cartCount={cartCount}
                onMenu={() => setDrawerOpen(true)}
                onCourseInfo={() => setInfoOpen(true)}
            />
            <UnderlineTabs aria-label="Course sections" layout="scroll" tabs={COURSE_SECTIONS} selectedId={section} onChange={setSection} />
            {section === "tee" && <DateStrip days={days} selectedId={day} onChange={setDay} className="bg-secondary/85 backdrop-blur-xl" />}
        </div>
    );

    return (
        <>
            <Screen nav={chrome} topInset={navHeight + 45 + (section === "tee" ? 68 : 0)}>
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
            </Screen>
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
