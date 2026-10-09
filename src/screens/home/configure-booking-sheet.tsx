import { useState } from "react";
import { ArrowLeft, ArrowRight } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Card } from "@/components/base/card";
import { SegmentedControl } from "@/components/base/segmented-control";
import { ChoiceChips, RadioCardGroup } from "@/components/forms/choice";
import { Notice } from "@/components/feedback/notice";
import { KeyValueRow } from "@/components/lists/list";
import { BottomSheet } from "@/components/overlays/bottom-sheet";
import type { TeeTime } from "@/components/lists/tee-time-card";
import { BOOKING_NOTICE, USER, currency, type Course } from "@/data/crane";

const CART_FEE = 26;

export interface ConfigureBookingSheetProps {
    teeTime: TeeTime | null;
    course: Course;
    dateLabel: string;
    onOpenChange: (open: boolean) => void;
    /** Start on the summary step (for stories). */
    initialStep?: "configure" | "summary";
    onReserve?: (booking: { players: number; holes: 9 | 18; transport: "walking" | "cart"; total: number }) => void;
}

/**
 * Configure Booking — two-step sheet off a tee time: choose players / holes /
 * transportation, then review the Booking Summary and Reserve.
 */
export const ConfigureBookingSheet = ({ teeTime, course, dateLabel, onOpenChange, initialStep = "configure", onReserve }: ConfigureBookingSheetProps) => {
    const [step, setStep] = useState(initialStep);
    const [players, setPlayers] = useState("1");
    const [holes, setHoles] = useState("18");
    const [transport, setTransport] = useState("walking");
    const [reserving, setReserving] = useState(false);

    if (!teeTime) return null;
    const count = Number(players);
    const total = (teeTime.price + (transport === "cart" ? CART_FEE : 0)) * count;
    const close = () => {
        onOpenChange(false);
        setStep(initialStep);
    };

    return (
        <BottomSheet
            isOpen={!!teeTime}
            onOpenChange={(o) => (o ? onOpenChange(true) : close())}
            title={step === "configure" ? "Configure Booking" : undefined}
            aria-label="Booking Summary"
            hideClose={step === "summary"}
            detent="large"
            footer={
                step === "configure" ? (
                    <div className="flex gap-3">
                        <Button color="outline" size="lg" onPress={close} className="w-[110px]">
                            Cancel
                        </Button>
                        <Button size="lg" fullWidth iconTrailing={ArrowRight} onPress={() => setStep("summary")} className="flex-1">
                            Continue
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Button color="outline-brand" size="lg" iconLeading={ArrowLeft} onPress={() => setStep("configure")} className="w-[110px]">
                            Back
                        </Button>
                        <Button
                            size="lg"
                            fullWidth
                            isLoading={reserving}
                            onPress={() => {
                                setReserving(true);
                                setTimeout(() => {
                                    setReserving(false);
                                    onReserve?.({ players: count, holes: holes === "9" ? 9 : 18, transport: transport as "walking" | "cart", total });
                                    close();
                                }, 900);
                            }}
                            className="flex-1"
                        >
                            Reserve
                        </Button>
                    </div>
                )
            }
        >
            {step === "configure" ? (
                <div className="space-y-5 px-5 py-4">
                    <div>
                        <div className="text-ios-headline text-primary">{course.name}</div>
                        <div className="text-ios-subheadline text-tertiary">{course.shortName}</div>
                    </div>
                    <div>
                        <div className="mb-2 flex items-baseline justify-between">
                            <span className="text-ios-headline text-primary">Number of Players</span>
                            <span className="text-ios-footnote text-tertiary">
                                {teeTime.spots} {teeTime.spots === 1 ? "spot" : "spots"} available
                            </span>
                        </div>
                        <ChoiceChips
                            aria-label="Number of players"
                            value={players}
                            onChange={setPlayers}
                            options={[1, 2, 3, 4].map((n) => ({ id: String(n), label: n, isDisabled: n > teeTime.spots }))}
                        />
                    </div>
                    <div>
                        <div className="mb-2 text-ios-headline text-primary">Number of Holes</div>
                        <SegmentedControl
                            aria-label="Number of holes"
                            variant="brand"
                            value={holes}
                            onChange={setHoles}
                            options={[
                                { id: "18", label: "18 Holes" },
                                { id: "9", label: "9 Holes" },
                            ]}
                        />
                    </div>
                    <RadioCardGroup
                        label="Transportation"
                        value={transport}
                        onChange={setTransport}
                        options={[
                            { id: "walking", label: "Walking" },
                            { id: "cart", label: "Golf Car", detail: currency(CART_FEE) },
                        ]}
                    />
                    <div className="flex items-center justify-between rounded-ios-control bg-secondary px-4 py-3.5">
                        <span className="text-ios-headline text-primary">Estimated Total</span>
                        <span className="text-ios-title3 font-bold text-brand-secondary tabular-nums">{currency(total)}</span>
                    </div>
                    <Notice variant="card" tone="warning" title="Booking Notice">
                        <div className="text-ios-footnote tracking-wide uppercase">{course.name}</div>
                        <p className="mt-2">Important Tee-Time Notes:</p>
                        <ul className="mt-1 space-y-1">
                            {BOOKING_NOTICE.map((n) => (
                                <li key={n}>• {n}</li>
                            ))}
                        </ul>
                    </Notice>
                </div>
            ) : (
                <div className="space-y-4 px-5 pt-4 pb-4">
                    <Notice tone="warning">This tee time starts within the course's 24 hours cancellation window. You won't be able to cancel it online, and a no-show fee may apply.</Notice>
                    <Card padding="none" className="divide-y divide-border-secondary">
                        <div className="p-4">
                            <h2 className="mb-2 text-ios-title3 text-primary">Booking Summary</h2>
                            <KeyValueRow label="Course:" value={course.shortName} />
                            <KeyValueRow label="Date & Time:" value={`${dateLabel} at ${teeTime.time}`} />
                            <KeyValueRow label="Players:" value={count} />
                            <KeyValueRow label="Holes:" value={holes} />
                        </div>
                        <div className="p-4">
                            <div className="mb-1 text-ios-footnote font-semibold tracking-[0.06em] text-tertiary uppercase">Green Fees</div>
                            {Array.from({ length: count }, (_, i) => (
                                <KeyValueRow
                                    key={i}
                                    label={<span className="text-primary">{i === 0 ? `${USER.firstName} ${USER.lastName} (WEEKDAY)` : `Guest ${i} (WEEKDAY)`}</span>}
                                    value={currency(teeTime.price)}
                                />
                            ))}
                            {transport === "cart" && <KeyValueRow label={<span className="text-primary">Golf Car × {count}</span>} value={currency(CART_FEE * count)} />}
                        </div>
                    </Card>
                    <p className="text-center text-ios-footnote text-tertiary italic">Final pricing including taxes and fees will be calculated at checkout.</p>
                </div>
            )}
        </BottomSheet>
    );
};
