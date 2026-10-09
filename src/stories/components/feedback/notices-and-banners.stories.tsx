import type { Meta, StoryObj } from "@storybook/react-vite";
import { Notice, StatusBanner } from "@/components/feedback/notice";
import { BOOKING_NOTICE } from "@/data/crane";
import { Caption, Panel, Specimen } from "../story-kit";

const TONES = ["error", "warning", "success", "info"] as const;

/**
 * **StatusBanner** — full-bleed solid strip under the nav bar for the state of the whole
 * screen ("This booking has expired"). **Notice** — inline message in the content flow:
 * `accent` (tinted card + coloured left rule), `soft` (tinted box + icon), `card`
 * (gray card with a tinted icon badge, for long notices).
 */
const meta: Meta<typeof Notice> = {
    title: "Components/Feedback/Notices & Banners",
    component: Notice,
    tags: ["autodocs"],
    args: {
        tone: "warning",
        variant: "soft",
        title: "",
        children: "This tee time starts within the course's 24 hours cancellation window. Please call the pro shop to make changes.",
    },
    argTypes: {
        tone: { control: "inline-radio", options: TONES },
        variant: { control: "inline-radio", options: ["accent", "soft", "card"] },
        title: { control: "text" },
        children: { control: "text" },
    },
    render: (args) => (
        <Panel className="w-[402px]">
            <Notice {...args} title={args.title || undefined} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof Notice>;

export const Playground: Story = {};

const BANNER_COPY = {
    error: "This booking has expired",
    warning: "Payment method expires soon",
    success: "Booking confirmed",
    info: "You're on the waitlist",
} as const;

/** One per tone. Error defaults to the clock icon (expired holds / bookings). */
export const StatusBanners: Story = {
    name: "Status banners",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-4 px-0">
            {TONES.map((t) => (
                <Specimen key={t} label={<span className="px-6">{t}</span>} className="items-stretch">
                    <StatusBanner tone={t}>{BANNER_COPY[t]}</StatusBanner>
                </Specimen>
            ))}
        </Panel>
    ),
};

/** Every variant × tone. `card` is gray, so it's shown on a white screen background. */
export const Variants: Story = {
    name: "Variants × tones",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-6">
            {(["accent", "soft", "card"] as const).map((v) => (
                <div key={v} className={v === "card" ? "-mx-3 flex flex-col gap-3 rounded-ios-card bg-primary p-3" : "flex flex-col gap-3"}>
                    <Caption>variant="{v}"</Caption>
                    {TONES.map((t) => (
                        <Notice key={t} tone={t} variant={v} title={`${t[0].toUpperCase()}${t.slice(1)} title`}>
                            Supporting text for the {t} tone.
                        </Notice>
                    ))}
                </div>
            ))}
        </Panel>
    ),
};

/** Real Crane copy from the booking and cancellation flows. */
export const CraneExamples: Story = {
    name: "Crane examples",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-4">
            <Specimen label="accent · error — cancel a past booking" className="items-stretch">
                <Notice tone="error" variant="accent">
                    This tee time is in the past and cannot be cancelled.
                </Notice>
            </Specimen>
            <Specimen label="soft · warning — inside the cancellation window" className="items-stretch">
                <Notice tone="warning" variant="soft">
                    This tee time starts within the course's 24 hours cancellation window. Cancelling now may incur a no-show fee.
                </Notice>
            </Specimen>
            <Specimen label="soft · success" className="items-stretch">
                <Notice tone="success" variant="soft" title="You're booked!">
                    A confirmation was sent to justin.girard@tenfore.golf.
                </Notice>
            </Specimen>
            <Specimen label="card · info — Booking Notice" className="items-stretch">
                <Notice tone="info" variant="card" title="Booking Notice" className="bg-primary shadow-ios-card">
                    <ul className="mt-1 list-disc space-y-1.5 pl-4">
                        {BOOKING_NOTICE.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </Notice>
            </Specimen>
        </Panel>
    ),
};
