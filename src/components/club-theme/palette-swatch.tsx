import { Check } from "@untitledui/icons";
import { paletteById, paletteChecks, paletteRamp, type PaletteCheck } from "@/data/club-themes";
import { RAMP_STEPS } from "@/utils/color-ramp";
import { cx } from "@/utils/cx";

/**
 * Palette swatches for the white-label club themes (src/data/club-themes.ts). Used by Buck's
 * "App appearance" page (src/screens/buck/app-appearance-page.tsx) and reusable in the palette gallery.
 *
 * Colours come from the palette's generated ramp (inline styles: they're data, not design tokens).
 * Selection and focus rings use the surrounding UI's brand token, so the swatch follows whatever
 * product it sits in (Buck green on the settings page, the club's own colour inside <ClubTheme>).
 */

/** Which mode a contrast check protects: on-white checks are light mode, on-dark checks are dark mode. */
export const checkMode = (c: PaletteCheck): "light" | "dark" => c.mode;

/** Pass/fail per mode, plus the checks themselves, for a "Contrast checked: light ✓ dark ✓" line. */
export const paletteContrastSummary = (paletteId: string) => {
    const checks = paletteChecks(paletteId);
    const light = checks.filter((c) => checkMode(c) === "light");
    const dark = checks.filter((c) => checkMode(c) === "dark");
    return { checks, light: light.every((c) => c.pass), dark: dark.every((c) => c.pass) };
};

export interface PaletteChipProps {
    paletteId: string;
    /**
     * `gradient` — a smooth 300 → 600 → 900 blend (the swatch face).
     * `steps` — three flat blocks: 300, 600, 900.
     * `ramp` — all twelve steps, 25 to 950, with the 600 (button) step outlined.
     */
    variant?: "gradient" | "steps" | "ramp";
    /** Size and radius come from here, e.g. `h-12 w-full rounded-lg`. */
    className?: string;
}

/** A chip that shows a palette's colours. Decorative: give the surrounding control the palette's name. */
export const PaletteChip = ({ paletteId, variant = "gradient", className }: PaletteChipProps) => {
    const r = paletteRamp(paletteId);
    if (variant === "gradient") {
        return (
            <span
                aria-hidden="true"
                className={cx("block h-10 w-full rounded-md ring-1 ring-secondary_alt ring-inset", className)}
                style={{ backgroundImage: `linear-gradient(135deg, ${r[300]} 0%, ${r[600]} 52%, ${r[900]} 100%)` }}
            />
        );
    }
    const steps = variant === "steps" ? ([300, 600, 900] as const) : RAMP_STEPS;
    return (
        <span aria-hidden="true" className={cx("flex h-6 w-full overflow-hidden rounded-md ring-1 ring-secondary_alt ring-inset", className)}>
            {steps.map((s) => (
                <span key={s} className={cx("h-full flex-1", variant === "ramp" && s === 600 && "ring-2 ring-white ring-inset")} style={{ background: r[s] }} title={`${s} · ${r[s]}`} />
            ))}
        </span>
    );
};

export interface PaletteSwatchProps {
    paletteId: string;
    isSelected?: boolean;
    /** Keyboard focus ring (pass React Aria's `isFocusVisible` when the swatch is a Radio). */
    isFocusVisible?: boolean;
    /** Show "Light ✓ Dark ✓" under the name of the selected swatch. */
    showContrast?: boolean;
    size?: "sm" | "md";
    className?: string;
}

/**
 * One palette as a pickable tile: a gradient chip of its ramp and its name. Selected: a brand ring and a
 * check badge. Presentational: wrap it in a React Aria `Radio` (render-prop children) to make it pickable.
 */
export const PaletteSwatch = ({ paletteId, isSelected, isFocusVisible, showContrast = true, size = "md", className }: PaletteSwatchProps) => {
    const p = paletteById(paletteId);
    const summary = isSelected && showContrast ? paletteContrastSummary(paletteId) : null;
    return (
        <span
            data-palette-swatch={p.id}
            data-selected={isSelected || undefined}
            className={cx(
                "relative flex w-full cursor-pointer flex-col gap-2 rounded-xl bg-primary text-left ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:ring-primary",
                size === "md" ? "p-2 pb-2.5" : "p-1.5 pb-2",
                isSelected && "ring-2 ring-brand hover:ring-brand",
                isFocusVisible && "outline-4 outline-offset-2 outline-brand-300/60",
                className,
            )}
        >
            <PaletteChip paletteId={p.id} className={size === "md" ? "h-14 rounded-lg" : "h-9 rounded-md"} />
            <span className="flex min-w-0 flex-col px-0.5">
                <span className={cx("truncate font-semibold text-primary", size === "md" ? "text-sm" : "text-xs")}>{p.name}</span>
                {summary && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-success-primary">
                        <span>Light {summary.light ? "✓" : "✕"}</span>
                        <span>Dark {summary.dark ? "✓" : "✕"}</span>
                    </span>
                )}
            </span>
            {isSelected && (
                <span className="absolute top-3.5 right-3.5 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white shadow-xs ring-2 ring-white">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                </span>
            )}
        </span>
    );
};
