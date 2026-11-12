import { useState } from "react";
import { ArrowRight, Calendar, Clock, MarkerPin01, Ticket02, Users01 } from "@untitledui/icons";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { currency, formatDate } from "@/data/crane";
import { EVENT_KIND_LABEL, PAST_EVENTS, REGISTERED_EVENTS, daysFromToday, type AccountEvent } from "./account-data";
import { AccountLayout } from "./account-layout";
import { AccountPanel, AccountTitle, EmptyBlock, Flash, LinkButton, Pill, TextAction, WebButton, useFlash } from "./account-ui";

const DateBlock = ({ date }: { date: Date }) => (
    <span aria-hidden="true" className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-primary_alt text-brand-secondary">
        <span className="caps text-[10px] leading-3 tracking-[1.5px]">{date.toLocaleDateString("en-US", { month: "short" })}</span>
        <span className="text-xl leading-6 font-bold tabular-nums">{date.getDate()}</span>
    </span>
);

const EventRow = ({ event: e, past }: { event: AccountEvent; past?: boolean }) => {
    const days = daysFromToday(e.date);
    return (
        <li>
            <WebLink
                href={`/account/events?open=${e.id}`}
                className="flex items-center gap-4 px-5 py-4 outline-none transition duration-100 ease-linear hover:bg-primary_hover focus-visible:bg-primary_hover focus-visible:ring-4 focus-visible:ring-brand-300/60 focus-visible:ring-inset"
            >
                <DateBlock date={e.date} />
                <span className="min-w-0 flex-1">
                    <span className="caps block text-[11px] text-quaternary">{EVENT_KIND_LABEL[e.kind]}</span>
                    <span className="block text-md font-semibold text-primary @tablet:truncate">{e.title}</span>
                    <span className="block text-sm text-tertiary @tablet:truncate">
                        {e.time} · {e.location} · {e.party}
                    </span>
                </span>
                <span className="hidden shrink-0 @tablet:block">
                    {past ? <Pill tone="gray">Completed</Pill> : <Pill tone={days <= 7 ? "warning" : "success"}>{days <= 7 ? `In ${days} day${days === 1 ? "" : "s"}` : "Registered"}</Pill>}
                </span>
            </WebLink>
        </li>
    );
};

const EventDialog = ({ event: e, registered, onClose, onCancel }: { event: AccountEvent | null; registered: boolean; onClose: () => void; onCancel: (e: AccountEvent) => void }) => {
    const [confirm, setConfirm] = useState(false);
    return (
        <WebDialog
            isOpen={!!e}
            onOpenChange={(o) => {
                if (!o) {
                    setConfirm(false);
                    onClose();
                }
            }}
            title={e?.title ?? ""}
            description={e ? `${EVENT_KIND_LABEL[e.kind]} · ${e.course.name}` : undefined}
            footer={
                e &&
                (confirm ? (
                    <>
                        <span className="mr-auto text-sm text-tertiary">Cancel your spot? Refunds go back to your card.</span>
                        <WebButton color="outline" onPress={() => setConfirm(false)}>
                            Keep
                        </WebButton>
                        <WebButton
                            color="destructive"
                            onPress={() => {
                                setConfirm(false);
                                onCancel(e);
                            }}
                        >
                            Cancel registration
                        </WebButton>
                    </>
                ) : (
                    <>
                        {registered && (
                            <TextAction tone="error" onPress={() => setConfirm(true)} className="mr-auto">
                                Cancel registration
                            </TextAction>
                        )}
                        <WebButton color="outline" onPress={onClose}>
                            Close
                        </WebButton>
                        {registered && <WebButton iconLeading={Calendar}>Add to calendar</WebButton>}
                    </>
                ))
            }
        >
            {e && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {registered ? <Pill>Registered</Pill> : <Pill tone="gray">Completed</Pill>}
                    </div>
                    <ul className="grid grid-cols-1 gap-2.5 text-md text-secondary @tablet:grid-cols-2">
                        {[
                            [Calendar, formatDate(e.date)],
                            [Clock, e.time],
                            [MarkerPin01, e.location],
                            [Users01, e.party],
                        ].map(([Icon, text], i) => {
                            const I = Icon as typeof Calendar;
                            return (
                                <li key={i} className="flex items-center gap-2">
                                    <I className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                    {text as string}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-md text-tertiary">{e.description}</p>
                    <p className="border-t border-secondary pt-4 text-md text-secondary">
                        Paid <span className="font-semibold text-primary tabular-nums">{currency(e.price)}</span> <span className="text-tertiary">{e.priceUnit}</span>
                    </p>
                </div>
            )}
        </WebDialog>
    );
};

export interface AccountEventsScreenProps {
    /** Registered events/clinics/leagues. Pass [] for the empty state. */
    events?: AccountEvent[];
    past?: AccountEvent[];
}

/**
 * Events — ports Fox "Profile ∕ Account/Events": what you've signed up for (events, clinics,
 * leagues), past registrations, and a quick-look dialog (deep link: /account/events?open=ev-2).
 */
export const AccountEventsScreen = ({ events: initial = REGISTERED_EVENTS, past = PAST_EVENTS }: AccountEventsScreenProps) => {
    const { path, navigate } = useWebRouter();
    const flash = useFlash();
    const [events, setEvents] = useState(initial);
    const openId = new URLSearchParams(path.split("?")[1] ?? "").get("open");
    const open = [...events, ...past].find((e) => e.id === openId) ?? null;
    const sorted = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

    return (
        <AccountLayout active="events">
            <div className="flex flex-col gap-8">
                <AccountTitle
                    title="Events"
                    subtitle="Events, clinics and leagues you've signed up for."
                    actions={
                        <LinkButton href="/events" color="outline" icon={ArrowRight}>
                            Browse events
                        </LinkButton>
                    }
                />
                <Flash message={flash.message} />

                <AccountPanel title="Registered" flush>
                    {sorted.length ? (
                        <ul className="divide-y divide-secondary">
                            {sorted.map((e) => (
                                <EventRow key={e.id} event={e} />
                            ))}
                        </ul>
                    ) : (
                        <EmptyBlock
                            icon={Ticket02}
                            title="No events yet"
                            description="Scrambles, clinics and leagues you sign up for will show up here."
                            action={
                                <div className="flex flex-wrap justify-center gap-2.5">
                                    <LinkButton href="/events">Browse events</LinkButton>
                                    <LinkButton href="/clinics" color="outline">
                                        See clinics
                                    </LinkButton>
                                </div>
                            }
                        />
                    )}
                </AccountPanel>

                {past.length > 0 && (
                    <AccountPanel title="Past" flush>
                        <ul className="divide-y divide-secondary">
                            {past.map((e) => (
                                <EventRow key={e.id} event={e} past />
                            ))}
                        </ul>
                    </AccountPanel>
                )}
            </div>

            <EventDialog
                event={open}
                registered={!!open && events.some((e) => e.id === open.id)}
                onClose={() => navigate("/account/events")}
                onCancel={(e) => {
                    setEvents((l) => l.filter((x) => x.id !== e.id));
                    navigate("/account/events");
                    flash.show(`Registration for ${e.title} cancelled`);
                }}
            />
        </AccountLayout>
    );
};
