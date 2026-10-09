import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Border tokens define the strokes that frame the TF Crane design
 * system — input fields, cards, dividers, and state outlines. Each color token
 * maps to a `border-<name>` Tailwind utility and a `--color-border-<name>` CSS
 * variable, and adapts across light and dark modes.
 */

type BorderColorToken = {
    name: string;
    /** Tailwind utility, when known. */
    utility?: string;
};

const borderColors: BorderColorToken[] = [
    { name: "border-primary", utility: "border-primary" },
    { name: "border-secondary", utility: "border-secondary" },
    { name: "border-secondary_alt", utility: "border-secondary_alt" },
    { name: "border-tertiary", utility: "border-tertiary" },
    { name: "border-brand", utility: "border-brand" },
    { name: "border-brand_alt", utility: "border-brand_alt" },
    { name: "border-error", utility: "border-error" },
    { name: "border-error_subtle", utility: "border-error_subtle" },
];

const borderWidths: { utility: string; px: string }[] = [
    { utility: "border-0", px: "0px" },
    { utility: "border", px: "1px" },
    { utility: "border-2", px: "2px" },
    { utility: "border-4", px: "4px" },
    { utility: "border-8", px: "8px" },
];

const BorderColorTile = ({ name, utility }: BorderColorToken) => {
    // The token name maps to `--color-border-<name>`, e.g.
    // border-secondary_alt -> --color-border-secondary_alt
    const cssVar = `--color-border-${name.replace(/^border-/, "")}`;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={utility ? `bg-primary rounded-lg size-28 border-2 ${utility}` : "bg-primary rounded-lg size-28"}
                style={utility ? undefined : { border: `2px solid var(${cssVar})` }}
            />
            <span className="text-xs font-mono text-tertiary">{name}</span>
        </div>
    );
};

const BorderWidthTile = ({ utility, px }: { utility: string; px: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`bg-primary rounded-lg size-28 border-primary ${utility}`} />
        <span className="text-xs font-mono text-tertiary">
            {utility} ({px})
        </span>
    </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">{children}</div>
);

const meta = {
    title: "Foundations/Border",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-10">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">Border colors</h2>
                <Grid>
                    {borderColors.map((token) => (
                        <BorderColorTile key={token.name} {...token} />
                    ))}
                </Grid>
            </div>
        </div>
    ),
};

export const Widths: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-10">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">Border widths</h2>
                <Grid>
                    {borderWidths.map((token) => (
                        <BorderWidthTile key={token.utility} {...token} />
                    ))}
                </Grid>
            </div>
        </div>
    ),
};

export const AllBorders: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-10">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">Border colors</h2>
                <Grid>
                    {borderColors.map((token) => (
                        <BorderColorTile key={token.name} {...token} />
                    ))}
                </Grid>
            </div>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-primary">Border widths</h2>
                <Grid>
                    {borderWidths.map((token) => (
                        <BorderWidthTile key={token.utility} {...token} />
                    ))}
                </Grid>
            </div>
        </div>
    ),
};
