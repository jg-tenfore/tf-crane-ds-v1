import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The TF Crane spacing scale. The base token is `--spacing` = 0.25rem = 4px
 * (Tailwind v4). A spacing step N equals `calc(var(--spacing) * N)` = N × 4px.
 * Consistent spacing keeps the booking flow calm and legible — generous gutters
 * around tee-time cards, tight rhythm inside dense tables.
 */

interface SpacingRowProps {
    /** The spacing step N. The rendered value is N × 4px. */
    n: number;
    /** The Tailwind utility name to reference (e.g. `p-4`, `gap-3`). */
    utility?: string;
}

const SpacingRow = ({ n, utility }: SpacingRowProps) => {
    const rem = `${n * 0.25}rem`;
    const px = `${n * 4}px`;

    return (
        <div className="flex items-center gap-4">
            <div className="flex h-3 w-48 items-center">
                <div
                    className="h-3 rounded-sm bg-brand-solid"
                    style={{ width: `calc(var(--spacing) * ${n})` }}
                />
            </div>
            <div className="font-mono text-xs text-tertiary">
                <span className="text-secondary">{n}</span> · {rem} · {px}
                {utility ? <span className="text-quaternary"> · {utility}</span> : null}
            </div>
        </div>
    );
};

const steps: { n: number; utility: string }[] = [
    { n: 0.5, utility: "p-0.5" },
    { n: 1, utility: "p-1" },
    { n: 1.5, utility: "p-1.5" },
    { n: 2, utility: "p-2" },
    { n: 2.5, utility: "p-2.5" },
    { n: 3, utility: "p-3" },
    { n: 3.5, utility: "p-3.5" },
    { n: 4, utility: "p-4" },
    { n: 5, utility: "p-5" },
    { n: 6, utility: "p-6" },
    { n: 8, utility: "p-8" },
    { n: 10, utility: "p-10" },
    { n: 12, utility: "p-12" },
    { n: 16, utility: "p-16" },
    { n: 20, utility: "p-20" },
    { n: 24, utility: "p-24" },
    { n: 32, utility: "p-32" },
    { n: 40, utility: "p-40" },
    { n: 48, utility: "p-48" },
    { n: 64, utility: "p-64" },
    { n: 80, utility: "p-80" },
    { n: 96, utility: "p-96" },
];

const meta = {
    title: "Foundations/Spacing",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
    render: () => (
        <div className="space-y-8 bg-primary p-8 text-primary">
            <div className="space-y-1">
                <h1 className="text-lg font-semibold text-primary">Spacing scale</h1>
                <p className="font-mono text-xs text-tertiary">
                    --spacing = 0.25rem = 4px · step N = calc(var(--spacing) * N) = N × 4px
                </p>
            </div>
            <div className="space-y-3">
                {steps.map((step) => (
                    <SpacingRow key={step.n} n={step.n} utility={step.utility} />
                ))}
            </div>
        </div>
    ),
};

export const UsageExample: Story = {
    render: () => (
        <div className="space-y-8 bg-primary p-8 text-primary">
            <div className="space-y-1">
                <h1 className="text-lg font-semibold text-primary">Usage example</h1>
                <p className="font-mono text-xs text-tertiary">
                    A tee-time card using p-4 (padding) and gap-3 (vertical rhythm).
                </p>
            </div>

            <div className="flex flex-col gap-3 rounded-sm border border-secondary bg-primary p-4 sm:max-w-sm">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-primary">Mount Hood — Front Nine</span>
                    <span className="font-mono text-xs text-quaternary">gap-3</span>
                </div>
                <p className="text-sm text-tertiary">Saturday · 7:40 AM · 4 players</p>
                <div className="flex items-center gap-2 border-t border-secondary pt-3">
                    <div className="size-8 rounded-sm bg-brand-solid" />
                    <span className="text-xs text-secondary">$120 per group</span>
                </div>
            </div>

            <div className="font-mono text-xs text-tertiary">
                Card padding: <span className="text-secondary">p-4</span> (16px) · Item gap:{" "}
                <span className="text-secondary">gap-3</span> (12px) · Divider pad:{" "}
                <span className="text-secondary">pt-3</span> (12px)
            </div>
        </div>
    ),
};
