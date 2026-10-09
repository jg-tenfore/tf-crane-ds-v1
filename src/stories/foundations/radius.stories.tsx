import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The TF Crane web border-radius scale (Fox). Every corner across the design system rounds
 * to one of these steps — from crisp square cards (`rounded-none`) through the
 * default `rounded-sm` used on most surfaces, up to the fully circular
 * `rounded-full` used for avatars, dots, and pill buttons.
 */
const meta = {
    title: "Foundations/Radius",
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RadiusTile>;

export default meta;
type Story = StoryObj<typeof meta>;

type RadiusToken = {
    name: string;
    rounded: string;
    value: string;
};

/** none → 3xl, in scale order. `rounded-full` is documented separately. */
const SCALE: RadiusToken[] = [
    { name: "rounded-none", rounded: "rounded-none", value: "0px" },
    { name: "rounded-xs", rounded: "rounded-xs", value: "0.125rem (2px)" },
    { name: "rounded-sm", rounded: "rounded-sm", value: "0.25rem (4px)" },
    { name: "rounded-md", rounded: "rounded-md", value: "0.375rem (6px)" },
    { name: "rounded-lg", rounded: "rounded-lg", value: "0.5rem (8px)" },
    { name: "rounded-xl", rounded: "rounded-xl", value: "0.75rem (12px)" },
    { name: "rounded-2xl", rounded: "rounded-2xl", value: "1rem (16px)" },
    { name: "rounded-3xl", rounded: "rounded-3xl", value: "1.5rem (24px)" },
];

const FULL: RadiusToken = { name: "rounded-full", rounded: "rounded-full", value: "9999px" };

/** A single radius swatch: a brand-solid block plus its utility name and value. */
const RadiusTile = ({ name, rounded, value }: RadiusToken) => (
    <div className="flex flex-col gap-3">
        <div className={`size-28 bg-brand-solid ${rounded}`} />
        <div className="text-xs font-mono text-tertiary">
            <div>{name}</div>
            <div>{value}</div>
        </div>
    </div>
);

const Grid = ({ tokens }: { tokens: RadiusToken[] }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6">
        {tokens.map((token) => (
            <RadiusTile key={token.name} {...token} />
        ))}
    </div>
);

/** The full radius scale from `rounded-none` through `rounded-3xl`. */
export const Scale: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-8">
            <h2 className="text-lg font-semibold text-secondary">Radius scale</h2>
            <Grid tokens={SCALE} />
        </div>
    ),
};

/** `rounded-full` on a square (becomes a circle) and on a wide pill. */
export const Full: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-8">
            <h2 className="text-lg font-semibold text-secondary">rounded-full</h2>
            <div className="flex flex-wrap items-end gap-8">
                <div className="flex flex-col gap-3">
                    <div className="size-28 bg-brand-solid rounded-full" />
                    <div className="text-xs font-mono text-tertiary">
                        <div>{FULL.name}</div>
                        <div>{FULL.value}</div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex h-12 w-44 items-center justify-center bg-brand-solid rounded-full text-sm font-medium text-white">
                        Book tee time
                    </div>
                    <div className="text-xs font-mono text-tertiary">
                        <div>{FULL.name}</div>
                        <div>pill button</div>
                    </div>
                </div>
            </div>
        </div>
    ),
};

/** Every radius token in the system, scale and full together. */
export const AllRadii: Story = {
    render: () => (
        <div className="bg-primary text-primary p-8 space-y-8">
            <h2 className="text-lg font-semibold text-secondary">All radii</h2>
            <Grid tokens={[...SCALE, FULL]} />
        </div>
    ),
};

/** iOS continuous-corner radii used by Crane components (from cupertino.css). */
export const IOS: Story = {
    name: "iOS radii",
    render: () => (
        <div className="min-h-screen bg-secondary p-10 font-body">
            <h2 className="text-ios-title1 text-primary">iOS radii</h2>
            <div className="mt-8 flex flex-wrap items-end gap-8">
                {[
                    ["rounded-ios-control", "12pt · fields, buttons", "h-[50px] w-[200px]"],
                    ["rounded-ios-card", "16pt · cards, grouped lists", "h-[120px] w-[200px]"],
                    ["rounded-ios-sheet", "38pt · sheets, alerts", "h-[200px] w-[200px]"],
                    ["rounded-ios-device", "55pt · iPhone 17 display", "h-[260px] w-[200px]"],
                    ["rounded-full", "capsules · tab bar, back button", "h-[44px] w-[200px]"],
                ].map(([cls, label, size]) => (
                    <div key={cls} className="flex flex-col gap-2">
                        <div className={`bg-primary shadow-ios-card ring-1 ring-secondary ${cls} ${size}`} />
                        <code className="font-mono text-ios-caption1 text-primary">{cls}</code>
                        <span className="text-ios-caption1 text-tertiary">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    ),
};
