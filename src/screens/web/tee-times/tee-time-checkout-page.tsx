import { useState } from "react";
import { AlertTriangle, ArrowLeft, Calendar, Check, ChevronDown, Clock, Flag01, InfoCircle, MarkerPin01, UserPlus01, Users01 } from "@untitledui/icons";
import { Button as AriaButton, Radio as AriaRadio, RadioGroup as AriaRadioGroup, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebFrame } from "@/components/web/web-frame";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { BOOKING_NOTICE, BUDDIES, PAYMENT_CARDS } from "@/data/crane";
import { useWebSession, WebShell } from "../web-shell";
import {
    CART_CUTOFF,
    CART_FEE,
    TODAY_ID,
    buddyPlayer,
    checkoutPath,
    confirmationPath,
    currency,
    dayType,
    defaultTeeTime,
    eighteenOnly,
    findTeeTime,
    fmtDay,
    insideCancelWindow,
    isBookable,
    playersLabel,
    priceRound,
    queryOf,
    seedPlayers,
    timeLabel,
    type Player,
    type Transport,
} from "./tee-times-data";
import { useTeeTimeRounds } from "./tee-time-rounds-store";
import { Detail, FaqAccordion, HoldTimerCard, MenuRow, PlayerAvatar, Row, SelectorCell, YouTag, focusRing, useHoldTimer, webBtn } from "./tee-times-ui";

export interface TeeTimeCheckoutPageProps {
    /** ISO date; defaults to `?d=` then today. */
    date?: string;
    /** Tee time id ("1324"); defaults to `?t=` then the first afternoon time with room for 4. */
    teeTimeId?: string;
    /** Players; defaults to `?p=` then 1. Seats 2–4 are pre-filled with golf buddies. */
    players?: number;
    /** Seconds left on the hold (default 5:00). 0 = the expired state. */
    holdSeconds?: number;
    /** Open the mobile summary expanded (story state). */
    summaryOpen?: boolean;
}

/**
 * Tee time checkout — ports Fox "Tee Time Checkout / Tee Time Details" ("You're one step from
 * the first tee"): Players · Holes · Transportation bar, player rows (golf buddies or guests),
 * booking notice, common questions, Booking Summary, the 5:00 hold timer and Reserve. Adds the
 * app's 24-hour cancellation warning and golf-car cutoff. Mobile web collapses the summary and
 * pins Reserve to the bottom.
 */
export const TeeTimeCheckoutPage = ({ date: dateProp, teeTimeId, players: playersProp, holdSeconds = 300, summaryOpen = false }: TeeTimeCheckoutPageProps) => {
    const { course, userName } = useWebSession();
    const { path, navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const rounds = useTeeTimeRounds();
    const q = queryOf(path);

    const date = dateProp ?? (q.get("d") && isBookable(q.get("d")!) ? q.get("d")! : TODAY_ID);
    const initialPlayers = playersProp ?? Math.min(4, Math.max(1, Number(q.get("p")) || 1));
    const teeTime = findTeeTime(course, date, teeTimeId ?? q.get("t") ?? "") ?? defaultTeeTime(course, date, initialPlayers);

    const maxPlayers = Math.max(1, teeTime.spots);
    const [players, setPlayers] = useState(Math.min(initialPlayers, maxPlayers));
    const [seats, setSeats] = useState<(Player | null)[]>(() => seedPlayers(Math.min(initialPlayers, maxPlayers)));
    const nineOnly = teeTime.holes === 9;
    const mustPlay18 = eighteenOnly(teeTime.minutes, date);
    const [holes, setHoles] = useState<9 | 18>(teeTime.holes);
    const cartAllowed = teeTime.minutes < CART_CUTOFF;
    const [transport, setTransport] = useState<Transport>("walking");
    const [open, setOpen] = useState<null | "players" | "holes" | "transport">(null);
    const [editSeat, setEditSeat] = useState<number | null>(null);
    const [mobileSummary, setMobileSummary] = useState(summaryOpen);
    const [reserving, setReserving] = useState(false);
    const hold = useHoldTimer(holdSeconds);

    const price = priceRound(teeTime, date, players, holes, transport);
    const late = insideCancelWindow(date, teeTime.minutes);
    const nameOf = (i: number) => seats[i]?.name ?? `Guest ${i}`;
    const go = (p: string) => {
        navigate(p);
        scrollToTop();
    };
    const findAnother = () => go(`/tee-times?d=${date}&p=${players}`);
    const cell = (k: NonNullable<typeof open>) => ({ isOpen: open === k, onOpenChange: (o: boolean) => setOpen(o ? k : null) });

    const reserve = () => {
        // Guests sign in first; the auth pages return here via ?next= with the booking intact.
        if (!userName) return go(`/sign-in?next=${encodeURIComponent(checkoutPath({ date, teeTimeId: teeTime.id, players }))}`);
        setReserving(true);
        setTimeout(() => {
            const party = Array.from({ length: players }, (_, i) => seats[i] ?? { id: `guest-${i + 1}`, name: `Guest ${i}` });
            const url = confirmationPath({ date, teeTimeId: teeTime.id, players: party, holes, transport });
            const id = url.split("/").pop()!.split("?")[0];
            rounds.add({
                id: `web-${id}`,
                course,
                date: new Date(`${date}T12:00:00`),
                time: teeTime.time,
                players,
                holes,
                status: "upcoming",
                transport,
                total: price.total,
                confirmation: id,
                teeTimeId: teeTime.id,
            });
            setReserving(false);
            go(url);
        }, 900);
    };

    const setCount = (n: number) => {
        setPlayers(n);
        setSeats((s) => Array.from({ length: 4 }, (_, i) => (i < n ? (s[i] ?? null) : null)));
    };

    /* ---- Summary (desktop aside + mobile collapsible) ---- */
    const summaryBody = (
        <>
            <div className="grid grid-cols-1 gap-2 border-b border-secondary px-5 py-4 @tablet:grid-cols-2">
                <Detail icon={Calendar}>{fmtDay(date, { weekday: "long", month: "short", day: "numeric" })}</Detail>
                <Detail icon={Clock}>{teeTime.time}</Detail>
                <Detail icon={Users01}>
                    {playersLabel(players)} · {holes} Holes
                </Detail>
                {teeTime.course && <Detail icon={Flag01}>{teeTime.course}</Detail>}
                <span className="@tablet:col-span-2">
                    <Detail icon={MarkerPin01}>{course.name}</Detail>
                </span>
            </div>
            <div className="flex flex-col gap-2.5 border-b border-secondary px-5 py-4">
                <p className="caps text-[11px] text-quaternary">Green fees</p>
                {Array.from({ length: players }, (_, i) => (
                    <Row
                        key={i}
                        label={
                            <>
                                {nameOf(i)} <span className="text-tertiary">({dayType(date)})</span>
                            </>
                        }
                        value={currency(price.fee)}
                    />
                ))}
            </div>
            <div className="flex flex-col gap-2.5 border-b border-secondary px-5 py-4">
                <p className="caps text-[11px] text-quaternary">Transportation</p>
                <Row label={transport === "cart" ? "Golf Car" : "Walking"} value={transport === "cart" ? `${currency(CART_FEE)} × ${players}` : "Included"} muted={transport === "walking"} />
            </div>
            <div className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-4">
                    <span className="text-md font-semibold text-primary">Estimated total</span>
                    <span className="text-display-xs font-semibold text-brand-secondary tabular-nums">{currency(price.total)}</span>
                </div>
                <p className="mt-2 text-sm text-tertiary">Paid at the course when you check in. Final pricing, including taxes and fees, is calculated there.</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                    <span className="rounded bg-tertiary px-1.5 py-0.5 text-[11px] font-semibold">{PAYMENT_CARDS[0].brand.toUpperCase()}</span>
                    •••• {PAYMENT_CARDS[0].last4} <span className="text-tertiary">· held for no-show fees only</span>
                </p>
            </div>
        </>
    );

    const reserveButton = (className?: string) => (
        <Button size="lg" fullWidth iconLeading={Flag01} isLoading={reserving} isDisabled={hold.expired} onPress={reserve} className={cx(webBtn, className)}>
            {userName ? "Reserve" : "Sign in to reserve"}
        </Button>
    );

    /* ---- Facts bar (Fox Players · Holes · Transportation) ---- */
    const facts = (
        <div className="relative grid grid-cols-2 divide-secondary rounded-xl bg-primary ring-1 ring-secondary ring-inset @tablet:grid-cols-3 @tablet:divide-x">
            <SelectorCell label="Players" value={playersLabel(players)} {...cell("players")}>
                {(close) => (
                    <div className="flex flex-col gap-0.5">
                        {[1, 2, 3, 4].map((n) => (
                            <MenuRow
                                key={n}
                                isDisabled={n > maxPlayers}
                                selected={players === n}
                                label={playersLabel(n)}
                                onPress={() => {
                                    setCount(n);
                                    close();
                                }}
                            />
                        ))}
                        <p className="px-3 pt-2 text-sm text-tertiary">
                            {maxPlayers} {maxPlayers === 1 ? "spot" : "spots"} open on this time.
                        </p>
                    </div>
                )}
            </SelectorCell>
            <SelectorCell label="Holes" value={`${holes} Holes`} {...cell("holes")} className="border-l border-secondary @tablet:border-l-0">
                {(close) => (
                    <div className="flex flex-col gap-0.5">
                        {([18, 9] as const).map((h) => (
                            <MenuRow
                                key={h}
                                isDisabled={(nineOnly && h === 18) || (mustPlay18 && h === 9)}
                                selected={holes === h}
                                label={`${h} Holes`}
                                detail={currency(priceRound(teeTime, date, 1, h, "walking").fee) + " per player"}
                                onPress={() => {
                                    setHoles(h);
                                    close();
                                }}
                            />
                        ))}
                        {(nineOnly || mustPlay18) && (
                            <p className="px-3 pt-2 text-sm text-tertiary">{nineOnly ? `This is a ${teeTime.course ?? "nine-hole"} time.` : "18-hole play is required before 1 PM on weekends & holidays."}</p>
                        )}
                    </div>
                )}
            </SelectorCell>
            <SelectorCell label="Transportation" value={transport === "cart" ? "Golf Car" : "Walking"} align="right" {...cell("transport")} className="col-span-2 border-t border-secondary @tablet:col-span-1 @tablet:border-t-0">
                {(close) => (
                    <div className="flex flex-col gap-0.5">
                        <MenuRow
                            selected={transport === "walking"}
                            label="Walking"
                            detail="Included"
                            onPress={() => {
                                setTransport("walking");
                                close();
                            }}
                        />
                        <MenuRow
                            isDisabled={!cartAllowed}
                            selected={transport === "cart"}
                            label="Golf Car"
                            detail={`${currency(CART_FEE)} per player`}
                            onPress={() => {
                                setTransport("cart");
                                close();
                            }}
                        />
                        {!cartAllowed && <p className="px-3 pt-2 text-sm text-tertiary">Golf cars stop two hours before sunset — walking only after {timeLabel(CART_CUTOFF)}.</p>}
                    </div>
                )}
            </SelectorCell>
        </div>
    );

    return (
        <WebShell active="tee-times" footer={false}>
            <WebPage width="content" className="pb-28 @desktop:pb-20">
                <PageHeader
                    back={
                        <WebLink href={`/tee-times?d=${date}&p=${players}`} className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            <ArrowLeft className="size-4" aria-hidden="true" /> Back to tee times
                        </WebLink>
                    }
                    eyebrow="Tee time checkout"
                    title="You're one step from the first tee"
                    subtitle={`Confirm your details to lock in your round at ${course.name}.`}
                />

                <div className="mt-8 grid grid-cols-1 gap-6 @desktop:grid-cols-[minmax(0,1fr)_360px] @desktop:gap-8">
                    <div className="flex min-w-0 flex-col gap-4">
                        {hold.expired && (
                            <Notice tone="error" title="Your hold on this tee time expired" className="rounded-lg text-sm">
                                It went back on the live tee sheet. Find another time — your player count carries over.
                                <AriaButton onPress={findAnother} className={cx("mt-2 block cursor-pointer rounded font-semibold text-error-primary underline underline-offset-2", focusRing)}>
                                    Find another time →
                                </AriaButton>
                            </Notice>
                        )}
                        {late && !hold.expired && (
                            <Notice tone="warning" className="rounded-lg text-sm">
                                This tee time starts within the course's 24-hour cancellation window. You won't be able to cancel it online, and a no-show fee may apply.
                            </Notice>
                        )}

                        {/* Mobile / tablet: collapsible summary */}
                        <div className="@desktop:hidden">
                            <Panel>
                                <AriaButton
                                    aria-expanded={mobileSummary}
                                    onPress={() => setMobileSummary((o) => !o)}
                                    className={cx("flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left", focusRing)}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-md font-semibold text-primary">Booking summary</span>
                                        <span className="block truncate text-sm text-tertiary">
                                            {fmtDay(date)} · {teeTime.time} · {playersLabel(players)}
                                        </span>
                                    </span>
                                    <span className="text-md font-semibold text-brand-secondary tabular-nums">{currency(price.total)}</span>
                                    <ChevronDown className={cx("size-5 text-fg-quaternary transition duration-100 ease-linear", mobileSummary && "rotate-180")} aria-hidden="true" />
                                </AriaButton>
                                {mobileSummary && <div className="border-t border-secondary">{summaryBody}</div>}
                            </Panel>
                        </div>

                        {facts}

                        {/* Players */}
                        <Panel
                            title={
                                <span className="flex items-center justify-between gap-3">
                                    <span>Players</span>
                                    <span className="text-sm font-normal text-tertiary">
                                        {seats.slice(0, players).filter(Boolean).length} of {players} added
                                    </span>
                                </span>
                            }
                        >
                            <ul className="divide-y divide-secondary">
                                {Array.from({ length: players }, (_, i) => {
                                    const p = seats[i];
                                    const me = i === 0;
                                    return (
                                        <li key={i}>
                                            <AriaButton
                                                onPress={() => !me && setEditSeat(i)}
                                                isDisabled={me}
                                                className={cx("group flex w-full items-center gap-3 px-5 py-4 text-left transition duration-100 ease-linear", !me && "cursor-pointer hover:bg-primary_hover", focusRing)}
                                            >
                                                <PlayerAvatar number={i + 1} name={p?.name} />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center gap-2 text-md font-semibold text-primary">
                                                        <span className="truncate">{p ? p.name : `Player ${i + 1}`}</span>
                                                        {me && <YouTag />}
                                                    </span>
                                                    <span className="block truncate text-sm text-tertiary">
                                                        {p ? [p.email, p.handicap != null ? `HCP ${p.handicap}` : null].filter(Boolean).join(" · ") : "Add a golf buddy or guest — or leave as Guest"}
                                                    </span>
                                                </span>
                                                {p ? (
                                                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                                                        <span className="flex items-center gap-1 text-sm font-medium text-success-primary">
                                                            <Check className="size-4" aria-hidden="true" /> {me ? "Confirmed" : "Added"}
                                                        </span>
                                                        {!me && <span className="text-xs text-tertiary">Tap to edit</span>}
                                                    </span>
                                                ) : (
                                                    <span className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-secondary ring-1 ring-primary ring-inset group-hover:bg-primary">
                                                        <UserPlus01 className="size-4 text-fg-quaternary" aria-hidden="true" /> Add player
                                                    </span>
                                                )}
                                            </AriaButton>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Panel>

                        {/* Booking notice */}
                        <Panel bodyClassName="px-5 py-5 @tablet:px-7 @tablet:py-6">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-full bg-warning-secondary">
                                    <AlertTriangle className="size-4 text-fg-warning-primary" aria-hidden="true" />
                                </span>
                                <h2 className="text-lg font-semibold text-primary">Booking notice</h2>
                            </div>
                            <p className="caps text-[11px] text-quaternary">{course.name} · Important tee-time notes</p>
                            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-tertiary marker:text-fg-quaternary">
                                {BOOKING_NOTICE.map((n) => (
                                    <li key={n}>{n}</li>
                                ))}
                            </ul>
                        </Panel>

                        <FaqAccordion id="common-questions" />
                    </div>

                    {/* Desktop aside */}
                    <aside className="hidden flex-col gap-4 @desktop:sticky @desktop:top-[136px] @desktop:flex @desktop:self-start">
                        <Panel title="Booking Summary">{summaryBody}</Panel>
                        <HoldTimerCard left={hold.left} mmss={hold.mmss} onFindAnother={findAnother} />
                        {!hold.expired && reserveButton()}
                        <p className="flex items-start gap-1.5 text-sm text-tertiary">
                            <InfoCircle className="mt-0.5 size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                            {late ? "Inside 24 hours — call the pro shop for changes." : "Free cancellation until 24 hours before your tee time."}
                        </p>
                    </aside>
                </div>

                {/* Tablet & mobile: hold timer inline above the sticky bar */}
                {hold.expired && (
                    <div className="mt-4 @desktop:hidden">
                        <HoldTimerCard left={hold.left} mmss={hold.mmss} onFindAnother={findAnother} />
                    </div>
                )}
            </WebPage>

            {/* Sticky Reserve — mobile & tablet */}
            <div className="sticky bottom-0 z-20 border-t border-secondary bg-primary px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] @tablet:px-8 @desktop:hidden">
                <div className="mx-auto flex max-w-web-content items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-primary tabular-nums">{currency(price.total)}</p>
                        <p className={cx("flex items-center gap-1 text-sm tabular-nums", hold.expired ? "text-error-primary" : hold.left < 60 ? "text-warning-primary" : "text-tertiary")}>
                            <Clock className="size-3.5" aria-hidden="true" />
                            {hold.expired ? "Hold expired" : `Held for ${hold.mmss}`}
                        </p>
                    </div>
                    {hold.expired ? (
                        <Button size="lg" color="destructive" onPress={findAnother} className={cx(webBtn, "flex-1")}>
                            Find another time
                        </Button>
                    ) : (
                        reserveButton("flex-1")
                    )}
                </div>
            </div>

            <PlayerDialog
                seat={editSeat}
                current={editSeat != null ? seats[editSeat] : null}
                taken={seats.filter((s, i) => s && i !== editSeat).map((s) => s!.id)}
                onClose={() => setEditSeat(null)}
                onSave={(p) => {
                    if (editSeat == null) return;
                    setSeats((s) => s.map((x, i) => (i === editSeat ? p : x)));
                    setEditSeat(null);
                }}
            />
        </WebShell>
    );
};

/* ---------- Add / edit player ---------- */

const PlayerDialog = ({ seat, current, taken, onClose, onSave }: { seat: number | null; current: Player | null; taken: string[]; onClose: () => void; onSave: (p: Player | null) => void }) => {
    const isBuddy = !!current && !current.id.startsWith("guest");
    const [mode, setMode] = useState<"buddy" | "guest">(current && !isBuddy ? "guest" : "buddy");
    const [buddy, setBuddy] = useState(isBuddy ? current!.id : "");
    const [first, setFirst] = useState(current && !isBuddy ? current.name.split(" ")[0] : "");
    const [last, setLast] = useState(current && !isBuddy ? current.name.split(" ").slice(1).join(" ") : "");
    const [email, setEmail] = useState(current && !isBuddy ? (current.email ?? "") : "");

    const key = `${seat}-${current?.id ?? "empty"}`;
    const save = () => {
        if (mode === "buddy") onSave(buddyPlayer(buddy) ?? null);
        else onSave({ id: `guest-${seat! + 1}`, name: [first.trim(), last.trim()].filter(Boolean).join(" ") || `Guest ${seat}`, email: email.trim() || undefined });
    };
    const canSave = mode === "buddy" ? !!buddy : first.trim().length > 0;

    return (
        <WebDialog
            key={key}
            isOpen={seat != null}
            onOpenChange={(o) => !o && onClose()}
            title={`Player ${(seat ?? 0) + 1}`}
            description="Add a golf buddy, or a guest's name so the pro shop can check them in."
            size="md"
            footer={
                <>
                    {current && (
                        <Button size="md" color="plain-destructive" onPress={() => onSave(null)} className={cx("mr-auto", webBtn)}>
                            Remove
                        </Button>
                    )}
                    <Button size="md" color="outline" onPress={onClose} className={webBtn}>
                        Cancel
                    </Button>
                    <Button size="md" isDisabled={!canSave} onPress={save} className={webBtn}>
                        Save Player
                    </Button>
                </>
            }
        >
            <AriaToggleButtonGroup
                aria-label="Player type"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[mode]}
                onSelectionChange={(keys) => {
                    const [k] = keys;
                    if (k) setMode(k as "buddy" | "guest");
                }}
                className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-tertiary p-1"
            >
                {(
                    [
                        ["buddy", "Golf buddies"],
                        ["guest", "Guest"],
                    ] as const
                ).map(([id, label]) => (
                    <AriaToggleButton
                        key={id}
                        id={id}
                        className={cx("h-9 cursor-pointer rounded-md text-sm font-semibold text-tertiary transition duration-100 ease-linear hover:text-secondary data-[selected]:bg-primary data-[selected]:text-primary data-[selected]:shadow-sm", focusRing)}
                    >
                        {label}
                    </AriaToggleButton>
                ))}
            </AriaToggleButtonGroup>
            {mode === "buddy" ? (
                <AriaRadioGroup aria-label="Golf buddies" value={buddy} onChange={setBuddy} className="flex flex-col gap-1">
                    {BUDDIES.map((b) => {
                        const p = buddyPlayer(b.id)!;
                        const used = taken.includes(b.id);
                        return (
                            <AriaRadio
                                key={b.id}
                                value={b.id}
                                isDisabled={used}
                                className={cx(
                                    "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ring-1 ring-transparent transition duration-100 ease-linear ring-inset hover:bg-primary_hover data-[selected]:bg-brand-primary_alt data-[selected]:ring-brand disabled:cursor-not-allowed disabled:opacity-50 data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
                                )}
                            >
                                <PlayerAvatar name={b.name || undefined} size="sm" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-md font-medium text-primary">{b.name || b.email}</span>
                                    <span className="block truncate text-sm text-tertiary">{used ? "Already in this booking" : [b.name ? b.email : "Invite pending", p.handicap != null ? `HCP ${p.handicap}` : null].filter(Boolean).join(" · ")}</span>
                                </span>
                            </AriaRadio>
                        );
                    })}
                </AriaRadioGroup>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                        <TextField label="First name" placeholder="e.g. Sam" value={first} onChange={setFirst} isRequired />
                        <TextField label="Last name" placeholder="e.g. Carter" value={last} onChange={setLast} />
                    </div>
                    <TextField label="Email (optional)" type="email" placeholder="sam.carter@tenfore.golf" value={email} onChange={setEmail} hint="We'll send them the tee time." />
                </div>
            )}
        </WebDialog>
    );
};

