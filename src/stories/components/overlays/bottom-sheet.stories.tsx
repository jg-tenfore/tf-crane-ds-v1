import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Mail01, MarkerPin01, Phone, User01 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { ChoiceChips, RadioCardGroup } from "@/components/forms/choice";
import { ListGroup, ListRow } from "@/components/lists/list";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { BottomSheet, type BottomSheetProps } from "@/components/overlays/bottom-sheet";
import { BOOKING_NOTICE, BUDDIES, courseById } from "@/data/crane";
import { ScreenFiller } from "../story-kit";

/**
 * BottomSheet — an iOS page sheet: grabber, title + close, scrolling body and an optional
 * pinned footer. Detents: `medium` (~half), `large` (top ~22% visible), `full` (to the
 * status bar). Dismiss via ×, scrim tap or Escape. Every story opens on load; use the
 * screen's button to reopen.
 */
const meta: Meta<typeof BottomSheet> = {
    title: "Components/Overlays/Bottom Sheet",
    component: BottomSheet,
    parameters: { phone: true },
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

const Demo = ({ children, ...sheet }: Omit<BottomSheetProps, "isOpen" | "onOpenChange" | "children"> & { children: ReactNode }) => {
    const [open, setOpen] = useState(true);
    return (
        <Screen
            nav={<NavigationBar backLabel="Tee Times" title="Tee Time Details" titleTone="brand" />}
            footer={
                <Button fullWidth onPress={() => setOpen(true)}>
                    Open Sheet
                </Button>
            }
        >
            <ScreenFiller count={4} />
            <BottomSheet isOpen={open} onOpenChange={setOpen} {...sheet}>
                {children}
            </BottomSheet>
        </Screen>
    );
};

const PlayersBody = () => {
    const [n, setN] = useState("2");
    const [ride, setRide] = useState("walking");
    return (
        <div className="space-y-5 px-5 py-4">
            <div className="space-y-2">
                <div className="text-ios-headline text-primary">Number of Players</div>
                <ChoiceChips aria-label="Number of players" value={n} onChange={setN} options={[1, 2, 3, 4].map((i) => ({ id: String(i), label: i }))} />
            </div>
            <RadioCardGroup
                label="Transportation"
                value={ride}
                onChange={setRide}
                options={[
                    { id: "walking", label: "Walking" },
                    { id: "cart", label: "Golf Car", detail: "$26.00" },
                ]}
            />
        </div>
    );
};

/** Medium detent — a quick choice. */
export const Medium: Story = {
    render: () => (
        <Demo title="Players" detent="medium">
            <PlayersBody />
        </Demo>
    ),
};

/** Large detent (default) — Booking Notice. */
export const Large: Story = {
    render: () => (
        <Demo title="Booking Notice" detent="large">
            <ul className="list-disc space-y-3 py-4 pr-5 pl-9 text-ios-body text-secondary">
                {BOOKING_NOTICE.map((l) => (
                    <li key={l}>{l}</li>
                ))}
            </ul>
        </Demo>
    ),
};

const course = courseById("sagamore-hampton");

/** Full detent — covers to the status bar. Course info. */
export const Full: Story = {
    render: () => (
        <Demo title={course.name} detent="full">
            <div className="space-y-5 py-4">
                <ListGroup header="Contact">
                    <ListRow icon={Phone} title="Call" subtitle={course.phone} onPress={() => {}} />
                    <ListRow icon={Mail01} title="Email" subtitle={course.email} onPress={() => {}} />
                    <ListRow icon={MarkerPin01} title="Directions" subtitle={course.address} onPress={() => {}} />
                </ListGroup>
            </div>
        </Demo>
    ),
};

/** Pinned footer (Cancel outline + Continue filled) over a long, scrolling body. */
export const WithFooter: Story = {
    name: "With footer & long body",
    render: () => (
        <Demo
            title="Add Players"
            detent="large"
            footer={
                <div className="flex gap-3">
                    <Button color="outline" className="flex-1">
                        Cancel
                    </Button>
                    <Button className="flex-1" iconTrailing={ArrowRight}>
                        Continue
                    </Button>
                </div>
            }
        >
            <div className="space-y-5 py-4">
                {["Golf Buddies", "Recent Players", "Suggested"].map((h) => (
                    <ListGroup key={h} header={h}>
                        {[...BUDDIES, ...BUDDIES].slice(0, 4).map((b, i) => (
                            <ListRow key={`${b.id}-${i}`} icon={User01} title={b.name} subtitle={`Handicap ${b.handicap}`} onPress={() => {}} />
                        ))}
                    </ListGroup>
                ))}
            </div>
        </Demo>
    ),
};
