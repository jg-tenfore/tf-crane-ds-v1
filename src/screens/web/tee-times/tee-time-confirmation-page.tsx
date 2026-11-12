import { useState, type FC, type ReactNode } from "react";
import { AlertTriangle, Calendar, CalendarPlus01, CheckCircle, Clock, Flag01, Hash01, MarkerPin01, Phone, Truck01, Users01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebFrame } from "@/components/web/web-frame";
import { Panel, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { BOOKING_NOTICE, PAYMENT_CARDS, USER, courseById } from "@/data/crane";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession, WebShell } from "../web-shell";
import sagamorePhoto from "./images/sagamore-spring-course.jpg";
import { CART_FEE, currency, dateOf, dayType, defaultTeeTime, findTeeTime, fmtDay, fmtLongDay, insideCancelWindow, parseConfirmation, playersLabel, priceRound, timeLabel } from "./tee-times-data";
import { useTeeTimeRounds } from "./tee-time-rounds-store";
import { PlayerAvatar, YouTag, focusRing, webBtn } from "./tee-times-ui";

export interface TeeTimeConfirmationPageProps {
    /** Confirmation number from /tee-times/confirmation/:id. */
    id?: string;
}

const DetailRow = ({ icon: Icon, label, children }: { icon: FC<{ className?: string }>; label: string; children: ReactNode }) => (
    <div className="flex items-center justify-between gap-4 py-3.5">
        <dt className="flex shrink-0 items-center gap-2.5 text-md whitespace-nowrap text-secondary">
            <Icon className="size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />
            {label}
        </dt>
        <dd className="text-right text-md font-medium text-primary">{children}</dd>
    </div>
);

/**
 * Tee time confirmation — ports Fox "Tee Time Checkout / Confirmation - Tee Time" (receipt card:
 * check, confirmation #, course, tee time details, who's going, payment, important info) and
 * "Booking / Pages / Confirmation" (You're booked!, add to calendar, directions, What's next).
 * Booking details come from the URL, so every confirmation is a real deep link.
 */
export const TeeTimeConfirmationPage = ({ id = "421292164" }: TeeTimeConfirmationPageProps) => {
    const session = useWebSession();
    const { path, navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const rounds = useTeeTimeRounds();
    const r = parseConfirmation(id, path, session.course);
    const course = r.courseId ? courseById(r.courseId) : session.course;
    const t = findTeeTime(course, r.date, r.teeTimeId) ?? defaultTeeTime(course, r.date, r.players.length);
    const n = r.players.length;
    const price = priceRound(t, r.date, n, r.holes, r.transport);
    const late = insideCancelWindow(r.date, t.minutes);
    const [calendar, setCalendar] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    const address = course.address ?? `${course.city}, ${course.state}`;
    const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${course.name}, ${address}`)}`;
    const cutoff = new Date(dateOf(r.date));
    cutoff.setDate(cutoff.getDate() - 1);
    const go = (p: string) => {
        navigate(p);
        scrollToTop();
    };

    return (
        <WebShell active="tee-times">
            <WebPage width="content">
                <div className="mx-auto flex max-w-[720px] flex-col gap-6">
                    {/* Success header */}
                    <header className="flex flex-col items-center text-center">
                        <span className={cx("flex size-14 items-center justify-center rounded-full", cancelled ? "bg-error-secondary" : "bg-success-secondary")}>
                            {cancelled ? <AlertTriangle className="size-7 text-fg-error-primary" aria-hidden="true" /> : <CheckCircle className="size-7 text-fg-success-primary" aria-hidden="true" />}
                        </span>
                        <p className="caps mt-4 text-brand-secondary">{cancelled ? "Reservation cancelled" : "Reservation confirmed"}</p>
                        <h1 className="mt-1 text-display-sm font-bold tracking-[-0.5px] text-primary @tablet:text-display-md">{cancelled ? "Your round is cancelled" : "You're booked!"}</h1>
                        <p className="mt-2 text-md text-tertiary">
                            {cancelled ? (
                                "We've let the pro shop know and emailed your players."
                            ) : (
                                <>
                                    We've emailed your confirmation to <span className="font-medium text-secondary">{USER.email}</span>
                                </>
                            )}
                        </p>
                    </header>

                    <Panel bodyClassName="flex flex-col">
                        {/* Course hero */}
                        <div className="relative h-44 overflow-hidden rounded-t-xl @tablet:h-56">
                            {course.id === "sagamore-spring" ? (
                                <img src={sagamorePhoto} alt={`${course.name} — the ninth hole`} className="size-full object-cover" />
                            ) : (
                                <div data-placeholder-asset="course-photo" className="flex size-full items-center justify-center bg-brand-section">
                                    <CourseLogo course={course} size={72} className="rounded-xl ring-0" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" aria-hidden="true" />
                            <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3 text-white">
                                <div className="min-w-0">
                                    <p className="truncate text-xl font-semibold">{course.name}</p>
                                    <p className="text-sm text-white/85">{address}</p>
                                </div>
                                <StatusBadge tone={cancelled ? "error" : "success"} className="text-sm">
                                    {cancelled ? "Cancelled" : "Confirmed"}
                                </StatusBadge>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="grid grid-cols-1 gap-2 border-b border-secondary px-5 py-4 @tablet:grid-cols-3">
                            <Button size="md" color="outline" iconLeading={CalendarPlus01} isDisabled={cancelled} onPress={() => setCalendar(true)} className={webBtn}>
                                Add to calendar
                            </Button>
                            <a
                                href={directions}
                                target="_blank"
                                rel="noreferrer"
                                className={cx("inline-flex h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-md font-semibold text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover", focusRing)}
                            >
                                <MarkerPin01 className="size-5" aria-hidden="true" /> Get directions
                            </a>
                            <WebLink
                                href="/tee-times/my-rounds"
                                className={cx("inline-flex h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 text-md font-semibold text-secondary ring-1 ring-primary ring-inset hover:bg-primary_hover", focusRing)}
                            >
                                <Flag01 className="size-5" aria-hidden="true" /> Manage booking
                            </WebLink>
                        </div>

                        {/* Tee time details */}
                        <section className="border-b border-secondary px-5 py-5 @tablet:px-7">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold text-primary">Tee time details</h2>
                                <span className="text-sm text-tertiary tabular-nums">#{r.id}</span>
                            </div>
                            <dl className="mt-2 divide-y divide-secondary">
                                <DetailRow icon={Calendar} label="Date">
                                    {fmtLongDay(r.date)}
                                </DetailRow>
                                <DetailRow icon={Clock} label="Tee time">
                                    {t.time}
                                </DetailRow>
                                <DetailRow icon={Users01} label="Players">
                                    {playersLabel(n)}
                                </DetailRow>
                                <DetailRow icon={Flag01} label="Holes">
                                    {r.holes} holes{t.course ? ` · ${t.course}` : ""}
                                </DetailRow>
                                <DetailRow icon={Truck01} label="Transportation">
                                    {r.transport === "cart" ? "Golf Car" : "Walking"}
                                </DetailRow>
                                <DetailRow icon={Hash01} label="Course confirmation">
                                    {course.shortName}|{r.id.slice(-5)}
                                </DetailRow>
                                <DetailRow icon={Phone} label="Booked by">
                                    {USER.firstName} {USER.lastName} · {USER.phone}
                                </DetailRow>
                            </dl>
                            {!cancelled &&
                                (late ? (
                                    <Notice tone="warning" className="mt-4 rounded-lg text-sm">
                                        This round starts within 24 hours, so it can't be changed or cancelled online. Call the pro shop{course.phone ? ` at ${course.phone}` : ""}.
                                    </Notice>
                                ) : (
                                    <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-success-primary px-5 py-2.5 text-center text-sm font-medium text-success-primary">
                                        <CheckCircle className="size-4 shrink-0" aria-hidden="true" />
                                        Free cancellation until {fmtDay(`${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`)} at {timeLabel(t.minutes)}
                                    </div>
                                ))}
                        </section>

                        {/* Who's going */}
                        <section className="border-b border-secondary px-5 py-5 @tablet:px-7">
                            <h2 className="text-lg font-semibold text-primary">Who's going</h2>
                            <ul className="mt-4 grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                {r.players.map((p, i) => (
                                    <li key={`${p.id}-${i}`} className="flex items-center gap-3">
                                        <PlayerAvatar number={i + 1} name={p.name} />
                                        <span className="min-w-0">
                                            <span className="flex items-center gap-2 text-md font-semibold text-primary">
                                                <span className="truncate">{p.name}</span>
                                                {p.id === "me" && <YouTag />}
                                            </span>
                                            <span className="block truncate text-sm text-tertiary">{p.email ?? "Guest"}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Payment */}
                        <section className="border-b border-secondary px-5 py-5 @tablet:px-7">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-primary">Payment details</h2>
                                <StatusBadge tone="gray">Due at check-in</StatusBadge>
                            </div>
                            <div className="mt-3 flex flex-col divide-y divide-secondary text-md">
                                <div className="flex justify-between gap-4 py-3">
                                    <span className="text-secondary">
                                        Green fees — {r.holes} holes × {n} <span className="text-tertiary">({dayType(r.date)})</span>
                                    </span>
                                    <span className="text-primary tabular-nums">{currency(price.fee * n)}</span>
                                </div>
                                {r.transport === "cart" && (
                                    <div className="flex justify-between gap-4 py-3">
                                        <span className="text-secondary">Golf Car × {n}</span>
                                        <span className="text-primary tabular-nums">{currency(CART_FEE * n)}</span>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between gap-4 py-3">
                                    <span className="text-lg font-semibold text-primary">Estimated total</span>
                                    <span className="text-display-xs font-semibold text-primary tabular-nums">{currency(price.total)}</span>
                                </div>
                            </div>
                            <p className="mt-1 text-sm text-tertiary">
                                Nothing was charged today. Your {PAYMENT_CARDS[0].brand} ending in {PAYMENT_CARDS[0].last4} is held only to cover no-show fees.
                            </p>
                        </section>

                        {/* Important information */}
                        <section id="important-information" className="px-5 py-5 @tablet:px-7">
                            <h2 className="text-lg font-semibold text-primary">Important information</h2>
                            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-tertiary marker:text-fg-quaternary">
                                {BOOKING_NOTICE.map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>
                            {!cancelled && (
                                <Button size="md" color="plain-destructive" onPress={() => setCancelOpen(true)} className={cx("mt-4 px-0", webBtn)}>
                                    Cancel reservation
                                </Button>
                            )}
                        </section>
                    </Panel>

                    <div className="flex flex-col gap-3 @tablet:flex-row">
                        <Button size="lg" color="outline" onPress={() => go("/tee-times/my-rounds")} className={cx("flex-1", webBtn)}>
                            View my rounds
                        </Button>
                        <Button size="lg" iconLeading={Flag01} onPress={() => go("/tee-times")} className={cx("flex-1", webBtn)}>
                            Book another tee time
                        </Button>
                    </div>
                </div>
            </WebPage>

            {/* Add to calendar */}
            <WebDialog
                isOpen={calendar}
                onOpenChange={setCalendar}
                title="Add to calendar"
                description={`${course.shortName} · ${fmtDay(r.date)} at ${t.time}`}
                size="sm"
            >
                <div className="flex flex-col gap-2 pb-2">
                    {["Apple Calendar (.ics)", "Google Calendar", "Outlook"].map((c) => (
                        <Button key={c} size="md" color="outline" iconLeading={CalendarPlus01} onPress={() => setCalendar(false)} className={cx("justify-start", webBtn)}>
                            {c}
                        </Button>
                    ))}
                </div>
            </WebDialog>

            {/* Cancel */}
            <WebDialog
                isOpen={cancelOpen}
                onOpenChange={setCancelOpen}
                title={late ? "Can't cancel online" : "Cancel this reservation?"}
                description={late ? "This round starts within the course's 24-hour window." : `${fmtLongDay(r.date)} at ${t.time} · ${playersLabel(n)}`}
                size="sm"
                footer={
                    late ? (
                        <Button size="md" onPress={() => setCancelOpen(false)} className={webBtn}>
                            OK
                        </Button>
                    ) : (
                        <>
                            <Button size="md" color="outline" onPress={() => setCancelOpen(false)} className={webBtn}>
                                Keep reservation
                            </Button>
                            <Button
                                size="md"
                                color="destructive"
                                onPress={() => {
                                    rounds.cancel(r.id);
                                    setCancelled(true);
                                    setCancelOpen(false);
                                }}
                                className={webBtn}
                            >
                                Cancel reservation
                            </Button>
                        </>
                    )
                }
            >
                <p className="text-md text-tertiary">
                    {late
                        ? `Call the pro shop${course.phone ? ` at ${course.phone}` : ""} to make changes. A no-show fee may apply if your group doesn't arrive.`
                        : "Your players will get an email, and the time goes back on the tee sheet. There's no fee when you cancel more than 24 hours ahead."}
                </p>
            </WebDialog>
        </WebShell>
    );
};
