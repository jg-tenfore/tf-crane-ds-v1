import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Effect styles document the TF Crane design system's shadow and
 * elevation tokens. Each `--shadow-*` CSS variable defined in the theme becomes
 * a Tailwind `shadow-*` utility; custom tokens are applied via the corresponding
 * CSS variable so they always resolve to the source of truth.
 */

type EffectTileProps = {
    /** The token name shown in the caption (without the `--shadow-` prefix). */
    token: string;
    /** Optional Tailwind utility class, e.g. `shadow-lg`. */
    shadowClassName?: string;
    /** Optional inline box-shadow value, e.g. `var(--shadow-skeuomorphic)`. */
    boxShadow?: string;
};

const EffectTile = ({ token, shadowClassName, boxShadow }: EffectTileProps) => (
    <div className="flex flex-col items-center gap-3">
        <div
            className={`flex size-32 items-center justify-center rounded-xl bg-primary ${shadowClassName ?? ""}`}
            style={boxShadow ? { boxShadow } : undefined}
        />
        <span className="font-mono text-xs text-tertiary">{token}</span>
    </div>
);

const TileGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl bg-secondary p-10">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-8">{children}</div>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-4">
        <h2 className="text-lg font-semibold text-secondary">{title}</h2>
        {children}
    </section>
);

const meta = {
    title: "Foundations/Effect Styles",
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EffectTile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The core elevation scale, from the subtle `shadow-xs` up to the dramatic `shadow-3xl`. */
export const Elevation: Story = {
    render: () => (
        <div className="space-y-10 bg-primary p-8 text-primary">
            <Section title="Elevation scale">
                <TileGrid>
                    <EffectTile token="shadow-xs" shadowClassName="shadow-xs" />
                    <EffectTile token="shadow-sm" shadowClassName="shadow-sm" />
                    <EffectTile token="shadow-md" shadowClassName="shadow-md" />
                    <EffectTile token="shadow-lg" shadowClassName="shadow-lg" />
                    <EffectTile token="shadow-xl" shadowClassName="shadow-xl" />
                    <EffectTile token="shadow-2xl" shadowClassName="shadow-2xl" />
                    <EffectTile token="shadow-3xl" shadowClassName="shadow-3xl" />
                </TileGrid>
            </Section>
        </div>
    ),
};

/** Inset skeuomorphic tokens used to give controls a tactile, recessed edge. */
export const Skeuomorphic: Story = {
    render: () => (
        <div className="space-y-10 bg-primary p-8 text-primary">
            <Section title="Skeuomorphic">
                <TileGrid>
                    <EffectTile token="shadow-skeuomorphic" boxShadow="var(--shadow-skeuomorphic)" />
                    <EffectTile token="shadow-xs-skeuomorphic" boxShadow="var(--shadow-xs-skeuomorphic)" />
                </TileGrid>
            </Section>
        </div>
    ),
};

/** Inner mockup shadows used inside device/screen mockup frames. */
export const MockupInner: Story = {
    render: () => (
        <div className="space-y-10 bg-primary p-8 text-primary">
            <Section title="Modern mockup — inner">
                <TileGrid>
                    <EffectTile token="shadow-modern-mockup-inner-sm" boxShadow="var(--shadow-modern-mockup-inner-sm)" />
                    <EffectTile token="shadow-modern-mockup-inner-md" boxShadow="var(--shadow-modern-mockup-inner-md)" />
                    <EffectTile token="shadow-modern-mockup-inner-lg" boxShadow="var(--shadow-modern-mockup-inner-lg)" />
                </TileGrid>
            </Section>
        </div>
    ),
};

/** Outer mockup shadows used to lift device/screen mockup frames off the page. */
export const MockupOuter: Story = {
    render: () => (
        <div className="space-y-10 bg-primary p-8 text-primary">
            <Section title="Modern mockup — outer">
                <TileGrid>
                    <EffectTile token="shadow-modern-mockup-outer-md" boxShadow="var(--shadow-modern-mockup-outer-md)" />
                    <EffectTile token="shadow-modern-mockup-outer-lg" boxShadow="var(--shadow-modern-mockup-outer-lg)" />
                </TileGrid>
            </Section>
        </div>
    ),
};

/** Every effect token in one place for a full reference sweep. */
export const AllEffects: Story = {
    render: () => (
        <div className="space-y-10 bg-primary p-8 text-primary">
            <Section title="Elevation scale">
                <TileGrid>
                    <EffectTile token="shadow-xs" shadowClassName="shadow-xs" />
                    <EffectTile token="shadow-sm" shadowClassName="shadow-sm" />
                    <EffectTile token="shadow-md" shadowClassName="shadow-md" />
                    <EffectTile token="shadow-lg" shadowClassName="shadow-lg" />
                    <EffectTile token="shadow-xl" shadowClassName="shadow-xl" />
                    <EffectTile token="shadow-2xl" shadowClassName="shadow-2xl" />
                    <EffectTile token="shadow-3xl" shadowClassName="shadow-3xl" />
                </TileGrid>
            </Section>

            <Section title="Skeuomorphic">
                <TileGrid>
                    <EffectTile token="shadow-skeuomorphic" boxShadow="var(--shadow-skeuomorphic)" />
                    <EffectTile token="shadow-xs-skeuomorphic" boxShadow="var(--shadow-xs-skeuomorphic)" />
                </TileGrid>
            </Section>

            <Section title="Modern mockup — inner">
                <TileGrid>
                    <EffectTile token="shadow-modern-mockup-inner-sm" boxShadow="var(--shadow-modern-mockup-inner-sm)" />
                    <EffectTile token="shadow-modern-mockup-inner-md" boxShadow="var(--shadow-modern-mockup-inner-md)" />
                    <EffectTile token="shadow-modern-mockup-inner-lg" boxShadow="var(--shadow-modern-mockup-inner-lg)" />
                </TileGrid>
            </Section>

            <Section title="Modern mockup — outer">
                <TileGrid>
                    <EffectTile token="shadow-modern-mockup-outer-md" boxShadow="var(--shadow-modern-mockup-outer-md)" />
                    <EffectTile token="shadow-modern-mockup-outer-lg" boxShadow="var(--shadow-modern-mockup-outer-lg)" />
                </TileGrid>
            </Section>
        </div>
    ),
};

/** The two shadows Crane actually uses on iPhone screens. */
export const IOS: Story = {
    name: "iOS shadows",
    render: () => (
        <div className="min-h-screen bg-secondary p-10 font-body">
            <h2 className="text-ios-title1 text-primary">iOS shadows</h2>
            <div className="mt-8 flex gap-10">
                {[
                    ["shadow-ios-card", "Cards & list groups on the grouped background"],
                    ["shadow-ios-float", "Sheets, drawers, floating chrome"],
                ].map(([cls, label]) => (
                    <div key={cls} className="flex flex-col gap-3">
                        <div className={`h-[140px] w-[240px] rounded-ios-card bg-primary ${cls}`} />
                        <code className="font-mono text-ios-caption1 text-primary">{cls}</code>
                        <span className="text-ios-caption1 text-tertiary">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    ),
};
