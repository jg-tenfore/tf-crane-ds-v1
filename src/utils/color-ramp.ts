/**
 * Brand ramps from one anchor colour, for club themes (white-label customization R&D, Nov 2026).
 *
 * Every palette is defined by its 600 step (the solid button colour). The other steps follow the
 * lightness curve of Crane's own green ramp in OKLCH, keeping the anchor's hue and scaling chroma, so a
 * navy or claret theme behaves exactly like the default brand everywhere a brand token is used.
 * No dependencies; plain sRGB ⇄ OKLab maths.
 */

export const RAMP_STEPS = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type RampStep = (typeof RAMP_STEPS)[number];
export type Ramp = Record<RampStep, string>;

type RGB = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export const hexToRgb = (hex: string): RGB => {
    const h = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};

const rgbToOklab = ([r, g, b]: RGB) => {
    const [lr, lg, lb] = [r, g, b].map((v) => toLinear(v / 255));
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};

const oklabToLinear = (L: number, a: number, b: number): RGB => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};

const inGamut = (lin: RGB) => lin.every((c) => c >= -1e-4 && c <= 1 + 1e-4);

/** OKLCH → sRGB, reducing chroma until the colour fits the sRGB gamut. */
const oklchToRgb = (L: number, C: number, H: number): RGB => {
    let c = C;
    for (let i = 0; i < 40; i++) {
        const lin = oklabToLinear(L, c * Math.cos(H), c * Math.sin(H));
        if (inGamut(lin)) return lin.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255)) as RGB;
        c *= 0.92;
    }
    const lin = oklabToLinear(L, 0, 0);
    return lin.map((v) => Math.round(toGamma(Math.min(1, Math.max(0, v))) * 255)) as RGB;
};

const toLch = (rgb: RGB) => {
    const [L, a, b] = rgbToOklab(rgb);
    return { L, C: Math.hypot(a, b), H: Math.atan2(b, a) };
};

/** Crane's green ramp (src/styles/theme.css): the lightness curve and chroma shape every theme follows. */
const CRANE_GREEN: Record<RampStep, RGB> = {
    25: [246, 252, 248],
    50: [236, 250, 241],
    100: [209, 242, 221],
    200: [166, 228, 188],
    300: [116, 208, 152],
    400: [74, 182, 117],
    500: [51, 156, 93],
    600: [44, 124, 77],
    700: [36, 102, 63],
    800: [30, 82, 51],
    900: [25, 67, 42],
    950: [14, 39, 24],
};
const BASE = Object.fromEntries(RAMP_STEPS.map((s) => [s, toLch(CRANE_GREEN[s])])) as Record<RampStep, { L: number; C: number; H: number }>;

const fmt = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

/**
 * The 25–950 ramp for an anchor 600 colour. Lightness moves with the anchor (a darker anchor darkens
 * the dark end proportionally, the light end stays airy); chroma scales by anchor/green, so muted
 * anchors (charcoal, sage) give muted ramps.
 */
export const rampFrom = (anchor600: string): Ramp => {
    const a = toLch(hexToRgb(anchor600));
    const base600 = BASE[600];
    const chromaScale = a.C / base600.C;
    const out = {} as Ramp;
    for (const s of RAMP_STEPS) {
        const b = BASE[s];
        // Steps at or below 600 shift their lightness by the anchor's offset, tapering to 0 at 25.
        const t = s >= 600 ? 1 : (b.L - BASE[25].L) / (base600.L - BASE[25].L);
        // The light half (≤ 500) moves at most ±0.07, so a very dark anchor (navy, claret) still has
        // icon and border steps that read on the dark page; the dark half follows the anchor fully.
        const shift = (a.L - base600.L) * t;
        const L = s === 600 ? a.L : Math.min(0.99, Math.max(0.12, b.L + (s < 600 ? Math.max(-0.07, Math.min(0.07, shift)) : shift)));
        out[s] = s === 600 ? fmt(hexToRgb(anchor600)) : fmt(oklchToRgb(L, b.C * chromaScale, a.H));
    }
    return out;
};

const parseRgb = (s: string): RGB => (s.match(/\d+/g) ?? []).slice(0, 3).map(Number) as RGB;

const luminance = (rgb: RGB) => {
    const [r, g, b] = rgb.map((v) => toLinear(v / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio between two colours ("rgb(r g b)" or "#rrggbb"). */
export const contrast = (x: string, y: string) => {
    const a = luminance(x.startsWith("#") ? hexToRgb(x) : parseRgb(x));
    const b = luminance(y.startsWith("#") ? hexToRgb(y) : parseRgb(y));
    const [hi, lo] = a > b ? [a, b] : [b, a];
    return (hi + 0.05) / (lo + 0.05);
};
