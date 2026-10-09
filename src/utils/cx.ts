import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                "display-xs",
                "display-sm",
                "display-md",
                "display-lg",
                "display-xl",
                "display-2xl",
                "ios-large-title",
                "ios-title1",
                "ios-title2",
                "ios-title3",
                "ios-headline",
                "ios-body",
                "ios-callout",
                "ios-subheadline",
                "ios-footnote",
                "ios-caption1",
                "ios-caption2",
            ],
            // Custom iOS tokens from cupertino.css, so a passed-in `rounded-full` / `shadow-*` wins.
            radius: ["ios-control", "ios-card", "ios-sheet", "ios-device"],
            shadow: ["ios-card", "ios-float"],
        },
    },
});

/** Merge Tailwind classes; later classes win. */
export const cx = twMerge;

/** Identity helper so Tailwind IntelliSense can sort classes inside style objects. */
export function sortCx<T extends Record<string, string | number | Record<string, string | number | Record<string, string | number>>>>(classes: T): T {
    return classes;
}
