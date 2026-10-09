import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Clock, Trophy01 } from "@untitledui/icons";
import { CountBadge, Pill, Tag, type TagTone } from "@/components/base/badge";
import { Caption, Panel, PanelHeading, Specimen } from "../story-kit";

const TONES: TagTone[] = ["brand", "gray", "error", "warning", "success"];
/** Real Crane words per tone. */
const WORDS: Record<TagTone, string> = { brand: "Booker", gray: "Guest", error: "Full", warning: "Pending", success: "Paid" };

/**
 * Tags, count badges and pills. **Tag** = short uppercase status word on a card
 * (FULL, BOOKER, GUEST). **CountBadge** = red notification count (hidden at 0, caps at 99+).
 * **Pill** = rounded informational chip ("🏆 0", "Expires in 30s", "Added").
 */
const meta: Meta<typeof Tag> = {
    title: "Components/Feedback/Badges & Tags",
    component: Tag,
    tags: ["autodocs"],
    args: { children: "Full", tone: "error", variant: "solid" },
    argTypes: {
        tone: { control: "inline-radio", options: TONES },
        variant: { control: "inline-radio", options: ["solid", "soft"] },
        icon: { control: false },
        children: { control: "text" },
    },
    render: (args) => (
        <Panel>
            <Tag {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof Tag>;

export const Playground: Story = {};

/** Solid × soft across every tone. */
export const Tags: Story = {
    render: () => (
        <Panel>
            <div className="grid grid-cols-[64px_repeat(5,auto)] items-center gap-x-5 gap-y-4">
                <span />
                {TONES.map((t) => (
                    <Caption key={t}>{t}</Caption>
                ))}
                {(["solid", "soft"] as const).map((v) => (
                    <div key={v} className="contents">
                        <Caption>{v}</Caption>
                        {TONES.map((t) => (
                            <div key={t}>
                                <Tag tone={t} variant={v}>
                                    {WORDS[t]}
                                </Tag>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Panel>
    ),
};

/** In use: player rows on a booking and a sold-out tee time. */
export const TagsInContext: Story = {
    name: "Tags in context",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-3">
            {[
                { name: "Justin Girard", tag: <Tag tone="brand">Booker</Tag> },
                { name: "Mike Callahan", tag: <Tag tone="gray" variant="soft">Guest</Tag> },
            ].map((p) => (
                <div key={p.name} className="flex items-center gap-2 rounded-ios-card bg-primary px-4 py-3 shadow-ios-card">
                    <span className="text-ios-headline text-primary">{p.name}</span>
                    {p.tag}
                </div>
            ))}
            <div className="flex items-center gap-2 rounded-ios-card bg-primary/60 px-4 py-4 opacity-60 shadow-ios-card">
                <span className="text-ios-title2 text-quaternary">2:45 PM</span>
                <Tag tone="error">Full</Tag>
            </div>
        </Panel>
    ),
};

/** Counts cap at 99+. Zero renders nothing unless `showZero`. */
export const CountBadges: Story = {
    name: "Count badges",
    render: () => (
        <Panel className="flex items-end gap-8">
            {[1, 9, 120].map((n) => (
                <Specimen key={n} label={`count ${n}`}>
                    <CountBadge count={n} />
                </Specimen>
            ))}
            <Specimen label="count 0">
                <span className="text-ios-footnote text-quaternary">(hidden)</span>
                <CountBadge count={0} />
            </Specimen>
            <Specimen label="0 · showZero">
                <CountBadge count={0} showZero />
            </Specimen>
        </Panel>
    ),
};

/** Pills: brand rewards points, gray timers and confirmations. */
export const Pills: Story = {
    render: () => (
        <Panel className="flex flex-col gap-5">
            <Specimen label='tone="brand" · Trophy01 — rewards points next to a name'>
                <div className="flex items-center gap-2">
                    <span className="text-ios-title2 text-primary">Justin Girard</span>
                    <Pill tone="brand" icon={Trophy01}>
                        0
                    </Pill>
                </div>
            </Specimen>
            <Specimen label="Clock — hold countdown">
                <Pill icon={Clock}>Expires in 30s</Pill>
            </Specimen>
            <Specimen label="Check — added to cart">
                <Pill icon={Check}>Added</Pill>
            </Specimen>
            <Specimen label="No icon">
                <Pill>18 holes</Pill>
            </Specimen>
        </Panel>
    ),
};

/** Everything at once, for a quick visual scan. */
export const Overview: Story = {
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-4">
            <PanelHeading>Overview</PanelHeading>
            <div className="flex flex-wrap items-center gap-2">
                <Tag tone="error">Full</Tag>
                <Tag tone="brand">Booker</Tag>
                <Tag tone="gray" variant="soft">
                    Guest
                </Tag>
                <CountBadge count={2} />
                <Pill tone="brand" icon={Trophy01}>
                    0
                </Pill>
                <Pill icon={Clock}>Expires in 30s</Pill>
                <Pill icon={Check}>Added</Pill>
            </div>
        </Panel>
    ),
};
