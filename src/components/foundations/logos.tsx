import { cx } from "@/utils/cx";

/**
 * Brand assets are served from the repo's /brand and /crane-logo folders
 * (see staticDirs in .storybook/main.ts). Paths are relative so they also
 * resolve under the GitHub Pages sub-path.
 */
export const BRAND_ASSETS = {
    craneIcon: "crane-logo/400x400bb.webp",
    craneIconJpg: "crane-logo/400x400bb-75.jpg",
    tfLogo: "brand/tf-logo.svg",
    tfLogoBlack: "brand/tf-logo-black.svg",
    tfLogoWhite: "brand/tf-logo-white.svg",
    tfSquareColor: "brand/tf-square-color.svg",
    tfSquareBlack: "brand/tf-square-black.svg",
    tfSquareWhite: "brand/tf-square-white.svg",
} as const;

export interface CraneAppIconProps {
    /** Edge length in pt. iOS home-screen icons are 60–64pt; App Store 1024px. */
    size?: number;
    /** Apply the iOS squircle mask + hairline. Off for the raw asset. */
    masked?: boolean;
    className?: string;
}

/** The TF Crane app icon — green line-art crane in a ring on white. */
export const CraneAppIcon = ({ size = 64, masked = true, className }: CraneAppIconProps) => (
    <img
        src={BRAND_ASSETS.craneIcon}
        alt="TF Crane"
        width={size}
        height={size}
        className={cx("shrink-0 object-cover", masked && "shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_6px_16px_rgba(0,0,0,0.08)]", className)}
        style={masked ? { borderRadius: size * 0.2237 } : undefined}
    />
);

export interface TfLogoProps {
    /** `color` = green mark + dark wordmark. */
    tone?: "color" | "black" | "white";
    /** `wordmark` = horizontal TenFore logo; `mark` = square badge. */
    variant?: "wordmark" | "mark";
    height?: number;
    className?: string;
}

/** TenFore Golf logo — the parent brand shown on sign-in and "Powered by" lockups. */
export const TfLogo = ({ tone = "color", variant = "wordmark", height = 28, className }: TfLogoProps) => {
    const src =
        variant === "mark"
            ? tone === "white" ? BRAND_ASSETS.tfSquareWhite : tone === "black" ? BRAND_ASSETS.tfSquareBlack : BRAND_ASSETS.tfSquareColor
            : tone === "white" ? BRAND_ASSETS.tfLogoWhite : tone === "black" ? BRAND_ASSETS.tfLogoBlack : BRAND_ASSETS.tfLogo;
    return <img src={src} alt="TenFore Golf" style={{ height }} className={cx("w-auto", className)} />;
};

/** App icon + "Crane" wordmark lockup for splash and auth screens. */
export const CraneLockup = ({ size = 88, className }: { size?: number; className?: string }) => (
    <div className={cx("flex flex-col items-center gap-3", className)}>
        <CraneAppIcon size={size} />
        <div className="text-center">
            <div className="font-display text-ios-title1 text-primary">Crane</div>
            <div className="text-ios-footnote text-tertiary">by TenFore Golf</div>
        </div>
    </div>
);
