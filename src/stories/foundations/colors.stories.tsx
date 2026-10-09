import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The TF Crane color foundations (Fox tokens), rendered straight from the live CSS variables.
 * Neutral greys carry the UI; the brand ramp is TenFore green. brand-600 (#227C48) is the
 * interactive colour and matches the green in the Crane app screenshots (#2C7C4D).
 * Semantic error/warning/success tokens stay red/amber/green.
 *
 * Every swatch reads its real `--color-*` variable inline so what you see is exactly
 * what ships, in both light and dark mode.
 */
const meta = {
    title: "Foundations/Colors",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TokenLabel = ({ token }: { token: string }) => <span className="text-xs text-tertiary font-mono break-all">{token}</span>;

/** A single fill swatch: a color block reading the CSS variable, the token name, and an optional usage note. */
const Swatch = ({ token, note }: { token: string; note?: string }) => (
    <div className="flex flex-col gap-1.5">
        <div className="h-16 w-full rounded-lg border border-secondary" style={{ background: `var(${token})` }} />
        <TokenLabel token={token} />
        {note && <span className="text-xs text-tertiary">{note}</span>}
    </div>
);

/** A text-token swatch: an "Aa" rendered with the token color on a white card, not a filled block. */
const TextSwatch = ({ token, note }: { token: string; note?: string }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex h-16 w-full items-center justify-center rounded-lg border border-secondary bg-primary">
            <span className="text-2xl font-semibold" style={{ color: `var(${token})` }}>
                Aa
            </span>
        </div>
        <TokenLabel token={token} />
        {note && <span className="text-xs text-tertiary">{note}</span>}
    </div>
);

/** A border-token swatch: a card outlined with the token color (inline border so the var resolves). */
const BorderSwatch = ({ token, note }: { token: string; note?: string }) => (
    <div className="flex flex-col gap-1.5">
        <div className="h-16 w-full rounded-lg bg-primary" style={{ border: `2px solid var(${token})` }} />
        <TokenLabel token={token} />
        {note && <span className="text-xs text-tertiary">{note}</span>}
    </div>
);

const SwatchGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">{children}</div>
);

const GroupHeading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-secondary">{children}</h3>
);

type Item = { token: string; note?: string };

const BASE: Item[] = [
    { token: "--color-white", note: "Always white" },
    { token: "--color-black", note: "Always black" },
];

const BRAND: Item[] = [
    { token: "--color-brand-50" },
    { token: "--color-brand-100" },
    { token: "--color-brand-200" },
    { token: "--color-brand-300" },
    { token: "--color-brand-400" },
    { token: "--color-brand-500", note: "Base brand" },
    { token: "--color-brand-600", note: "Primary interactive (near-black)" },
    { token: "--color-brand-700" },
    { token: "--color-brand-800" },
    { token: "--color-brand-900" },
    { token: "--color-brand-950", note: "Darkest" },
];

const TEXT: Item[] = [
    { token: "--color-text-primary", note: "Headings" },
    { token: "--color-text-secondary", note: "Labels" },
    { token: "--color-text-tertiary", note: "Supporting text" },
    { token: "--color-text-quaternary", note: "Subtle text" },
    { token: "--color-text-placeholder", note: "Input placeholders" },
    { token: "--color-text-white", note: "On dark fills" },
    { token: "--color-text-brand-primary" },
    { token: "--color-text-brand-secondary" },
    { token: "--color-text-brand-tertiary" },
    { token: "--color-text-error-primary", note: "Error state" },
    { token: "--color-text-warning-primary", note: "Warning state" },
    { token: "--color-text-success-primary", note: "Success state" },
];

const FOREGROUND: Item[] = [
    { token: "--color-fg-primary", note: "Highest-contrast icons" },
    { token: "--color-fg-secondary" },
    { token: "--color-fg-tertiary" },
    { token: "--color-fg-quaternary", note: "Input/help icons" },
    { token: "--color-fg-white" },
    { token: "--color-fg-brand-primary", note: "Featured icons" },
    { token: "--color-fg-brand-secondary" },
    { token: "--color-fg-error-primary" },
    { token: "--color-fg-error-secondary" },
    { token: "--color-fg-warning-primary" },
    { token: "--color-fg-warning-secondary" },
    { token: "--color-fg-success-primary" },
    { token: "--color-fg-success-secondary" },
];

const BACKGROUND: Item[] = [
    { token: "--color-bg-primary", note: "Default page bg" },
    { token: "--color-bg-primary_hover" },
    { token: "--color-bg-primary-solid", note: "Tooltips" },
    { token: "--color-bg-secondary", note: "Section bg" },
    { token: "--color-bg-secondary_hover" },
    { token: "--color-bg-tertiary", note: "Toggles" },
    { token: "--color-bg-quaternary", note: "Sliders, progress" },
    { token: "--color-bg-active", note: "Active menu items" },
    { token: "--color-bg-overlay", note: "Modal overlay" },
    { token: "--color-bg-brand-primary" },
    { token: "--color-bg-brand-secondary" },
    { token: "--color-bg-brand-solid", note: "Toggles, messages" },
    { token: "--color-bg-brand-solid_hover" },
    { token: "--color-bg-brand-section", note: "CTA sections" },
    { token: "--color-bg-error-primary" },
    { token: "--color-bg-error-secondary" },
    { token: "--color-bg-error-solid" },
    { token: "--color-bg-warning-primary" },
    { token: "--color-bg-warning-secondary" },
    { token: "--color-bg-warning-solid" },
    { token: "--color-bg-success-primary" },
    { token: "--color-bg-success-secondary" },
    { token: "--color-bg-success-solid" },
];

const BORDER: Item[] = [
    { token: "--color-border-primary", note: "Inputs, checkboxes" },
    { token: "--color-border-secondary", note: "Default border" },
    { token: "--color-border-secondary_alt", note: "Floating menus" },
    { token: "--color-border-tertiary", note: "Subtle dividers" },
    { token: "--color-border-brand", note: "Active states" },
    { token: "--color-border-brand_alt" },
    { token: "--color-border-error", note: "Error inputs" },
    { token: "--color-border-error_subtle" },
];

const Section = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
    <section className="space-y-3">
        <GroupHeading>{heading}</GroupHeading>
        {children}
    </section>
);

const Page = ({ children }: { children: React.ReactNode }) => <div className="bg-primary text-primary p-8 space-y-10">{children}</div>;

const BaseSection = () => (
    <Section heading="Base">
        <SwatchGrid>
            {BASE.map((item) => (
                <Swatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

const BrandSection = () => (
    <Section heading="Brand ramp (greyscale)">
        <SwatchGrid>
            {BRAND.map((item) => (
                <Swatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

const TextSection = () => (
    <Section heading="Text">
        <SwatchGrid>
            {TEXT.map((item) => (
                <TextSwatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

const ForegroundSection = () => (
    <Section heading="Foreground (fg)">
        <SwatchGrid>
            {FOREGROUND.map((item) => (
                <Swatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

const BackgroundSection = () => (
    <Section heading="Background (bg)">
        <SwatchGrid>
            {BACKGROUND.map((item) => (
                <Swatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

const BorderSection = () => (
    <Section heading="Border">
        <SwatchGrid>
            {BORDER.map((item) => (
                <BorderSwatch key={item.token} {...item} />
            ))}
        </SwatchGrid>
    </Section>
);

/** Base palette plus the monochromatic brand ramp. */
export const Brand: Story = {
    render: () => (
        <Page>
            <BaseSection />
            <BrandSection />
        </Page>
    ),
};

/** Text fill tokens, shown as "Aa" in the token color on a white card. */
export const Text: Story = {
    render: () => (
        <Page>
            <TextSection />
        </Page>
    ),
};

/** Non-text foreground tokens such as icon fills. */
export const Foreground: Story = {
    render: () => (
        <Page>
            <ForegroundSection />
        </Page>
    ),
};

/** Background fill tokens across neutral, brand, and semantic states. */
export const Background: Story = {
    render: () => (
        <Page>
            <BackgroundSection />
        </Page>
    ),
};

/** Border / stroke tokens, drawn as outlined cards. */
export const Border: Story = {
    render: () => (
        <Page>
            <BorderSection />
        </Page>
    ),
};

/** The complete token reference: every group on one page. */
export const AllColors: Story = {
    render: () => (
        <Page>
            <BaseSection />
            <BrandSection />
            <TextSection />
            <ForegroundSection />
            <BackgroundSection />
            <BorderSection />
        </Page>
    ),
};
