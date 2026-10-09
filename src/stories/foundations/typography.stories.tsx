import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Crane uses the iOS system font (SF Pro on Apple devices, Inter as the web fallback)
 * and Apple's Dynamic Type scale at the default "Large" content size. Each style is
 * a Tailwind utility — `text-ios-headline`, `text-ios-footnote` — carrying size,
 * line height, tracking and (where Apple specifies one) weight.
 */
const meta = {
    title: "Foundations/Typography",
    parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const IOS_STYLES = [
    { cls: "text-ios-large-title", name: "Large Title", spec: "34 / 41 · Bold", use: "Root screen titles, hero numbers", sample: "Tee Times" },
    { cls: "text-ios-title1", name: "Title 1", spec: "28 / 34 · Bold", use: "Auth headlines, Community", sample: "Welcome back" },
    { cls: "text-ios-title2", name: "Title 2", spec: "22 / 28 · Bold", use: "Tee time, sheet titles", sample: "9:03 AM" },
    { cls: "text-ios-title3", name: "Title 3", spec: "20 / 25 · Semibold", use: "Section headings, prices", sample: "Course Details" },
    { cls: "text-ios-headline", name: "Headline", spec: "17 / 22 · Semibold", use: "Nav titles, row titles", sample: "Account Balance" },
    { cls: "text-ios-body", name: "Body", spec: "17 / 22 · Regular", use: "Inputs, button labels, body copy", sample: "justin.girard@tenfore.golf" },
    { cls: "text-ios-callout", name: "Callout", spec: "16 / 21 · Regular", use: "Empty-state messages", sample: "No memberships found" },
    { cls: "text-ios-subheadline", name: "Subheadline", spec: "15 / 20 · Regular", use: "Row subtitles, card metadata", sample: "4 spots available · 18 holes" },
    { cls: "text-ios-footnote", name: "Footnote", spec: "13 / 18 · Regular", use: "Captions, helper text", sample: "Use the trash icon to remove a card." },
    { cls: "text-ios-caption1", name: "Caption 1", spec: "12 / 16 · Regular", use: "Field labels in grouped forms", sample: "NAME ON CARD" },
    { cls: "text-ios-caption2", name: "Caption 2", spec: "11 / 13 · Regular", use: "Tab bar labels, tags", sample: "Bookings" },
];

const Page = ({ children }: { children: React.ReactNode }) => <div className="min-h-screen bg-primary p-10 font-body text-primary">{children}</div>;

export const DynamicType: Story = {
    name: "iOS Dynamic Type",
    render: () => (
        <Page>
            <h1 className="text-ios-title1">iOS Dynamic Type</h1>
            <p className="mt-1 max-w-[640px] text-ios-subheadline text-tertiary">
                Size / line height in points at the default content size. Font: <code className="font-mono">-apple-system</code> → SF Pro Text / Display.
            </p>
            <div className="mt-8 divide-y divide-border-secondary border-y border-secondary">
                {IOS_STYLES.map((s) => (
                    <div key={s.cls} className="grid grid-cols-[180px_1fr_260px] items-center gap-6 py-4">
                        <div>
                            <div className="text-ios-subheadline font-semibold">{s.name}</div>
                            <code className="font-mono text-ios-caption1 text-tertiary">{s.cls}</code>
                        </div>
                        <div className={s.cls}>{s.sample}</div>
                        <div className="text-ios-footnote text-tertiary">
                            <div className="font-medium text-secondary">{s.spec}</div>
                            {s.use}
                        </div>
                    </div>
                ))}
            </div>
        </Page>
    ),
};

export const Weights: Story = {
    render: () => (
        <Page>
            <h1 className="text-ios-title1">Weights</h1>
            <div className="mt-6 space-y-3">
                {[
                    ["font-normal", "Regular 400 — body, subtitles"],
                    ["font-medium", "Medium 500 — field labels, selected tabs"],
                    ["font-semibold", "Semibold 600 — headlines, buttons"],
                    ["font-bold", "Bold 700 — titles, times, prices"],
                ].map(([cls, label]) => (
                    <div key={cls} className={`text-ios-title3 ${cls}`}>
                        {label}
                    </div>
                ))}
            </div>
        </Page>
    ),
};

export const InContext: Story = {
    name: "In context",
    render: () => (
        <Page>
            <h1 className="text-ios-title1">Hierarchy in a Crane card</h1>
            <div className="mt-6 w-[370px] rounded-ios-card bg-primary px-4 py-3.5 shadow-ios-card ring-1 ring-secondary">
                <div className="flex items-baseline justify-between">
                    <span className="text-ios-title2">9:03 AM</span>
                    <span className="text-ios-title3 font-bold">$53.00</span>
                </div>
                <div className="mt-1 text-ios-subheadline text-tertiary">1 spot available · 18 holes</div>
                <div className="text-ios-subheadline text-tertiary">SHGC</div>
                <div className="mt-1 text-ios-footnote text-tertiary">Reserved (x3)</div>
            </div>
            <p className="mt-3 text-ios-footnote text-tertiary">Title 2 time · Title 3 price · Subheadline metadata · Footnote tertiary detail.</p>
        </Page>
    ),
};
