import type { ReactNode } from "react";
import { paletteStyle } from "@/data/club-themes";
import { cx } from "@/utils/cx";
import "@/styles/club-theme.css";

/**
 * Re-colours everything inside it with a club palette (src/data/club-themes.ts): sets the brand ramp
 * (--color-brand-25 … 950) and, through src/styles/club-theme.css, re-resolves every brand token, in
 * light and dark. `display: contents`, so it never changes layout.
 */
export const ClubTheme = ({ paletteId, children, className }: { paletteId: string; children: ReactNode; className?: string }) => (
    <div className={cx("club-theme contents", className)} style={paletteStyle(paletteId)} data-palette={paletteId}>
        {children}
    </div>
);
