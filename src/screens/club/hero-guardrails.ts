/**
 * Hero guardrails for the club home (white-label customization R&D, Nov 24, 2026 call).
 *
 * A course gives us one photo and nothing else about the hero. Everything that makes it look good is
 * built in, not left to the course:
 * - The photo is always cropped to the header's box at the course's focus point (`heroFocus`).
 * - A dark scrim is always applied, and its strength is measured from the photo, so white text on the
 *   brightest part of the text area still gets 4.5:1.
 * - No photo → the TenFore default photo set (Overcast classic) crossfades in. Never a TenFore logo.
 * - A photo that's too small still renders; `heroQuality()` tells Buck's App appearance page to warn.
 */
import { useEffect, useState } from "react";
import { defaultArtList, TENFORE_DEFAULT_SET, type DefaultPhotoSetId } from "@/screens/web/instruction/data/default-art";

/** The hero box on iPhone 17 (pt), status bar included. The photo is always cropped to this aspect. */
export const HERO_SIZE = { width: 402, height: 248 } as const;
export const HERO_ASPECT = HERO_SIZE.width / HERO_SIZE.height;

/** 402 pt across at @3x is 1206 px: a narrower photo gets upscaled on current iPhones. */
export const HERO_MIN_WIDTH = 1200;

export type HeroFocus = { x: number; y: number };
export const DEFAULT_HERO_FOCUS: HeroFocus = { x: 0.5, y: 0.5 };

/** CSS `object-position` for a focus point (0–1 from the left / top). */
export const objectPosition = (f: HeroFocus = DEFAULT_HERO_FOCUS) => `${Math.round(f.x * 100)}% ${Math.round(f.y * 100)}%`;

/* ------------------------------------------------------------------ */
/* Quality check (for Buck)                                            */
/* ------------------------------------------------------------------ */

export type HeroQualityLevel = "good" | "low" | "unknown";

export interface HeroQuality {
    level: HeroQualityLevel;
    /** Photo pixels that end up across the header after the crop (less than the width for very wide photos). */
    usableWidth?: number;
    minWidth: number;
    /** Warning copy for Buck's App appearance page; `null` when there's nothing to say. */
    message: string | null;
}

/**
 * Is this hero photo big enough? Pass the photo's pixel size (Buck knows it at upload; `useImageSize`
 * measures it otherwise). Height is optional: with it, a very wide photo is judged on the width it keeps
 * after cropping to the header. A "low" photo still renders in the app; only Buck warns.
 */
export const heroQuality = (width?: number, height?: number): HeroQuality => {
    if (!width) return { level: "unknown", minWidth: HERO_MIN_WIDTH, message: null };
    const usableWidth = Math.round(height ? Math.min(width, height * HERO_ASPECT) : width);
    if (usableWidth >= HERO_MIN_WIDTH) return { level: "good", usableWidth, minWidth: HERO_MIN_WIDTH, message: null };
    const minHeight = Math.ceil(HERO_MIN_WIDTH / HERO_ASPECT);
    const message =
        usableWidth < width
            ? `This photo is wide and short, so only ${usableWidth} px of it fit across the header. It will still show, but may look soft. Use one at least ${HERO_MIN_WIDTH} × ${minHeight} px.`
            : `This photo is ${width} px wide. It will still show, but may look soft on newer iPhones. Use one at least ${HERO_MIN_WIDTH} px wide.`;
    return { level: "low", usableWidth, minWidth: HERO_MIN_WIDTH, message };
};

/* ------------------------------------------------------------------ */
/* Fallback photos                                                     */
/* ------------------------------------------------------------------ */

/**
 * Photos from a default set that work as a landscape hero (open course, few or distant people), in
 * crossfade order. Picked by eye from Overcast classic (TENFORE_DEFAULT_SET): the junior-league
 * fairway, the op-36 green with the flag, and the clinic range.
 */
const HERO_PICKS = [
    ["junior-league", 0],
    ["op36", 1],
    ["clinic", 2],
] as const;

/** The hero photos for a course without its own: 3 photos from its default set (TenFore's by default). */
export const heroFallbackPhotos = (set: DefaultPhotoSetId = TENFORE_DEFAULT_SET): string[] =>
    HERO_PICKS.map(([format, i]) => defaultArtList(set, format)[i]).filter(Boolean);

/* ------------------------------------------------------------------ */
/* Image loading + measuring                                           */
/* ------------------------------------------------------------------ */

const images = new Map<string, Promise<HTMLImageElement>>();

/** Load (once per URL) and decode an image. Works for Vite asset URLs and `blob:` URLs from an upload. */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
    let p = images.get(src);
    if (!p) {
        p = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Couldn't load ${src}`));
            img.src = src;
        });
        images.set(src, p);
        p.catch(() => images.delete(src));
    }
    return p;
};

/** The natural pixel size of an image, once loaded (undefined before, or without a src). */
export const useImageSize = (src: string | undefined) => {
    const [size, setSize] = useState<{ src: string; width: number; height: number }>();
    useEffect(() => {
        if (!src) return;
        let live = true;
        loadImage(src)
            .then((img) => live && setSize({ src, width: img.naturalWidth, height: img.naturalHeight }))
            .catch(() => {});
        return () => {
            live = false;
        };
    }, [src]);
    return size && size.src === src ? { width: size.width, height: size.height } : undefined;
};

/* ------------------------------------------------------------------ */
/* Automatic scrim                                                     */
/* ------------------------------------------------------------------ */

/** The scrim never goes below these, even on a dark photo ("always applied"), or above them. */
export const SCRIM_RANGE = { text: [0.6, 0.9], top: [0.3, 0.6] } as const;
/**
 * How bright a spot the text must survive: the 95th-percentile luminance of the text area, so a few
 * bright patches (a white tent, sky through trees) count, but a single specular glint doesn't.
 */
const SCRIM_PERCENTILE = 0.95;
/** Used until the photo is measured (and if it can't be). */
const SCRIM_DEFAULT = { text: 0.75, top: 0.45 };

const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, n));

/**
 * Black scrim alpha so white text over a patch of luminance `l` reaches `ratio`. Browsers blend in sRGB,
 * so a black layer at alpha `a` scales each encoded channel by (1 − a): roughly luminance × (1 − a)^2.2.
 */
export const scrimAlphaFor = (l: number, ratio: number, range: readonly [number, number]) => {
    const target = 1.05 / ratio - 0.05;
    return clamp(l <= target ? 0 : 1 - (target / l) ** (1 / 2.2), range);
};

/** 85th-percentile luminance of the photo as the hero crops it: the top band (status bar) and the text band. */
const measure = (img: HTMLImageElement, focus: HeroFocus) => {
    const w = 48;
    const h = Math.round(w / HERO_ASPECT);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // Same crop as `object-fit: cover` + `object-position: focus`.
    const sw = iw / ih > HERO_ASPECT ? ih * HERO_ASPECT : iw;
    const sh = iw / ih > HERO_ASPECT ? ih : iw / HERO_ASPECT;
    ctx.drawImage(img, (iw - sw) * focus.x, (ih - sh) * focus.y, sw, sh, 0, 0, w, h);
    let data: Uint8ClampedArray;
    try {
        data = ctx.getImageData(0, 0, w, h).data;
    } catch {
        return null; // cross-origin photo without CORS: keep the default scrim
    }
    const band = (top: number, bottom: number, left = 0, right = 1) => {
        const lums: number[] = [];
        for (let y = Math.floor(top * h); y < Math.ceil(bottom * h); y += 1) {
            for (let x = Math.floor(left * w); x < Math.ceil(right * w); x += 1) {
                const i = (y * w + x) * 4;
                lums.push(0.2126 * lin(data[i]) + 0.7152 * lin(data[i + 1]) + 0.0722 * lin(data[i + 2]));
            }
        }
        lums.sort((a, b) => a - b);
        return lums[Math.floor(SCRIM_PERCENTILE * (lums.length - 1))] ?? 0;
    };
    // Status bar + buttons: the top quarter. Name + tagline: the bottom third, right of the (opaque) logo tile.
    return { top: band(0, 0.25), text: band(0.62, 1, 0.18, 0.95) };
};

export interface HeroScrim {
    /** Alpha of the bottom (text) scrim. */
    text: number;
    /** Alpha of the top (status bar) scrim. */
    top: number;
    /** The measured luminance (0–1) of the text area's bright spots; undefined until measured. */
    luminance?: number;
    measured: boolean;
}

/** Scrim strengths for a hero photo: measured from the photo so white text always reads. */
export const useHeroScrim = (src: string | undefined, focus: HeroFocus = DEFAULT_HERO_FOCUS): HeroScrim => {
    const [m, setM] = useState<{ key: string; top: number; text: number } | null>(null);
    const key = `${src}|${focus.x}|${focus.y}`;
    useEffect(() => {
        if (!src) return;
        let live = true;
        loadImage(src)
            .then((img) => {
                const r = measure(img, focus);
                if (live && r) setM({ key, ...r });
            })
            .catch(() => {});
        return () => {
            live = false;
        };
    }, [key]); // `key` covers src and focus
    // Keep the last measurement while a new photo loads (crossfade, a Buck swap) so the scrim doesn't pulse.
    if (!m) return { ...SCRIM_DEFAULT, measured: false };
    return {
        // Tagline is small text (4.5:1); the status bar glyphs only need 3:1.
        text: scrimAlphaFor(m.text, 4.5, SCRIM_RANGE.text),
        top: scrimAlphaFor(m.top, 3, SCRIM_RANGE.top),
        luminance: m.text,
        measured: m.key === key,
    };
};
