import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { SegmentedControl } from "@/components/base/segmented-control";
import { Switch } from "@/components/base/switch";
import { ClubTheme } from "@/components/club-theme/club-theme";
import { CLUB_PALETTES, PALETTE_FAMILIES, paletteChecks, paletteRamp, type ClubPalette } from "@/data/club-themes";
import { RAMP_STEPS } from "@/utils/color-ramp";
import { cx } from "@/utils/cx";

/**
 * The 12 club palettes for white-label Crane apps (Nov 24, 2026 customization R&D). A course picks one
 * in Buck; it never types a hex code. Each palette is one anchor colour (the 600 step); the full
 * 25–950 ramp is generated along Crane's own green curve (src/utils/color-ramp.ts), so every component
 * that uses a brand token follows it. Every palette must pass these checks in light and dark: this
 * story throws (and the test run fails) if one doesn't.
 */
const meta: Meta = {
    title: "Explorations/Club customization/Palettes",
    parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

/** The same few components every palette is judged on: a primary button, a tinted button, a selected chip, a badge, a link and a switch. */
const Sample = () => {
    const [seg, setSeg] = useState("18");
    const [on, setOn] = useState(true);
    return (
        <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 ring-1 ring-secondary">
            <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Book now</Button>
                <Button size="sm" color="tinted">
                    Add to cart
                </Button>
                <Tag tone="brand">Members</Tag>
                <Tag tone="brand" variant="soft">
                    New
                </Tag>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <SegmentedControl
                    aria-label="Holes"
                    variant="brand"
                    value={seg}
                    onChange={setSeg}
                    options={[
                        { id: "18", label: "18 Holes" },
                        { id: "9", label: "9 Holes" },
                    ]}
                />
                <Switch isSelected={on} onChange={setOn} aria-label="Notifications" />
                <span className="text-sm font-semibold text-brand-secondary underline">View tee times</span>
            </div>
        </div>
    );
};

const PaletteCard = ({ p }: { p: ClubPalette }) => {
    const ramp = paletteRamp(p.id);
    const checks = paletteChecks(p.id);
    const failed = checks.filter((c) => !c.pass);
    if (failed.length) throw new Error(`Palette ${p.name} fails: ${failed.map((c) => `${c.label} ${c.ratio}:1 < ${c.min}:1`).join(", ")}`);
    return (
        <section className="flex flex-col gap-3 rounded-2xl bg-primary p-4 ring-1 ring-secondary" aria-label={p.name}>
            <header className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-primary">{p.name}</h3>
                    <p className="text-sm text-tertiary">{p.blurb}</p>
                </div>
                <span className="shrink-0 rounded-full bg-success-primary px-2 py-0.5 text-xs font-semibold text-success-primary">Contrast ✓</span>
            </header>
            <div className="flex overflow-hidden rounded-lg ring-1 ring-secondary" role="img" aria-label={`${p.name} ramp, 25 to 950`}>
                {RAMP_STEPS.map((s) => (
                    <span key={s} className={cx("h-8 flex-1", s === 600 && "ring-2 ring-white ring-inset")} style={{ background: ramp[s] }} title={`${s} · ${ramp[s]}`} />
                ))}
            </div>
            <ClubTheme paletteId={p.id}>
                <Sample />
                <div className="dark-mode rounded-xl">
                    <Sample />
                </div>
            </ClubTheme>
            <details className="text-xs text-tertiary">
                <summary className="cursor-pointer font-medium text-secondary">Contrast checks</summary>
                <ul className="mt-2 flex flex-col gap-1">
                    {checks.map((c) => (
                        <li key={c.label} className="flex justify-between gap-2 tabular-nums">
                            <span>{c.label}</span>
                            <span className="font-semibold text-success-primary">
                                {c.ratio}:1 (min {c.min})
                            </span>
                        </li>
                    ))}
                </ul>
            </details>
        </section>
    );
};

const Gallery = () => (
    <div className="min-h-screen bg-secondary p-8 font-body text-primary">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
            <header className="flex max-w-3xl flex-col gap-2">
                <span className="caps text-brand-secondary">Explorations · Club customization</span>
                <h1 className="text-display-sm font-bold">12 palettes, picked not typed</h1>
                <p className="text-md text-tertiary">
                    A course chooses one of these in Buck. Each is a single anchor colour; the rest of the ramp is generated on Crane&rsquo;s own curve and checked
                    for contrast in light and dark, so buttons, links, chips and badges always read. The top row of each card is light mode, the bottom row dark.
                </p>
            </header>
            {PALETTE_FAMILIES.map((f) => (
                <section key={f.id} className="flex flex-col gap-3">
                    <div>
                        <h2 className="text-display-xs font-semibold">{f.label}</h2>
                        <p className="text-sm text-tertiary">{f.blurb}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {CLUB_PALETTES.filter((p) => p.family === f.id).map((p) => (
                            <PaletteCard key={p.id} p={p} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    </div>
);

export const AllPalettes: Story = {
    name: "All 12 palettes",
    render: () => <Gallery />,
    parameters: { docs: { description: { story: "Every palette with its ramp, a light and a dark component sample, and its contrast checks. Throws if any check fails." } } },
};
