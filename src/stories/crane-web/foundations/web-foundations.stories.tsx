import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebFrame } from "@/components/web/web-frame";
import { CapsTabs, PageHeader, SectionHeading, WebPage } from "@/components/web/web-layout";

/**
 * Crane Web foundations: the browser frame and its three review widths, the container
 * breakpoints, and the Outfit type scale. Colour, radius and shadows are the same tokens
 * as Crane mobile (see Foundations).
 */
const meta: Meta = {
    title: "Crane Web/Foundations",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

const Ruler = () => (
    <WebPage>
        <PageHeader eyebrow="Layout" title="Container breakpoints" subtitle="Components respond to the frame width, not the Storybook window." />
        <div className="mt-8 grid gap-3">
            <div className="rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset">
                <span className="caps text-quaternary">Base (&lt; 768)</span>
                <p className="mt-1 text-md text-primary">Mobile web — native layout: menu · course · cart, section tabs underneath.</p>
            </div>
            <div className="hidden rounded-xl bg-primary p-4 ring-1 ring-brand ring-inset @tablet:block">
                <span className="caps text-brand-secondary">@tablet (≥ 768)</span>
                <p className="mt-1 text-md text-primary">Utility row appears; section links move into their own scrolling row.</p>
            </div>
            <div className="hidden rounded-xl bg-primary p-4 ring-1 ring-brand ring-inset @desktop:block">
                <span className="caps text-brand-secondary">@desktop (≥ 1024)</span>
                <p className="mt-1 text-md text-primary">Full two-row header with inline uppercase section nav. Page rail 1200, checkout rail 1080.</p>
            </div>
            <div className="grid grid-cols-4 gap-3 @desktop:grid-cols-12">
                {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className={`h-16 rounded-md bg-brand-primary_alt ${i >= 4 ? "hidden @desktop:block" : ""}`} />
                ))}
            </div>
        </div>
    </WebPage>
);

export const Widths: Story = {
    name: "Frame widths",
    render: () => (
        <div className="flex flex-col gap-10 p-6">
            <WebFrame width="desktop" height={520} url="crane.tenfore.golf  ·  1440 desktop">
                <Ruler />
            </WebFrame>
            <div className="flex flex-wrap items-start gap-10">
                <div className="min-w-[640px] flex-1">
                    <WebFrame width="laptop" height={520} url="1024 laptop">
                        <Ruler />
                    </WebFrame>
                </div>
                <div className="w-[390px]">
                    <WebFrame width="mobile" height={640} url="390 mobile web">
                        <Ruler />
                    </WebFrame>
                </div>
            </div>
        </div>
    ),
};

const TYPE = [
    ["text-display-md font-bold tracking-[-0.5px]", "Page title", "36 / 44 · Bold", "Shop · Your Cart"],
    ["text-display-xs font-semibold tracking-[-0.3px]", "Section", "24 / 32 · Semibold", "Club Offerings"],
    ["text-xl font-semibold tracking-[-0.3px]", "Course name / card title", "20 / 30 · Semibold", "Sagamore Spring Golf Club"],
    ["text-md font-semibold", "Product title / row", "16 / 24 · Semibold", "Titleist Pro V1 Golf Balls (Dozen)"],
    ["text-md", "Body", "16 / 24 · Regular", "Review your items before checkout."],
    ["text-sm", "Supporting", "14 / 20 · Regular", "4 to 7 business days"],
    ["caps", "Caps (nav, tabs, eyebrows, small CTAs)", "12 / 16 · 600 · +2px", "Tee Times · Your Order · Join →"],
] as const;

export const Typography: Story = {
    render: () => (
        <div className="p-6">
            <WebFrame height={640} url="Outfit — Crane Web type scale">
                <WebPage>
                    <PageHeader eyebrow="Typography" title="Outfit" subtitle="Scoped to Crane Web. iPhone screens keep SF Pro." />
                    <div className="mt-8 divide-y divide-border-secondary rounded-xl bg-primary ring-1 ring-secondary ring-inset">
                        {TYPE.map(([cls, name, spec, sample]) => (
                            <div key={name} className="grid grid-cols-[220px_1fr] items-center gap-6 px-5 py-4">
                                <div>
                                    <div className="text-sm font-semibold text-primary">{name}</div>
                                    <div className="font-mono text-xs text-tertiary">{cls}</div>
                                    <div className="text-xs text-quaternary">{spec}</div>
                                </div>
                                <div className={`${cls} text-primary`}>{sample}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10">
                        <SectionHeading title="Club Offerings" count={4} />
                        <CapsTabs
                            label="Example tabs"
                            tabs={[
                                { href: "#all", label: "All", active: true },
                                { href: "#balls", label: "Golf Balls" },
                                { href: "#hats", label: "Hats" },
                            ]}
                        />
                    </div>
                </WebPage>
            </WebFrame>
        </div>
    ),
};
