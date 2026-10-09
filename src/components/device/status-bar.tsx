import { cx } from "@/utils/cx";

export interface StatusBarProps {
    /** `dark` = black glyphs (light screens). `light` = white glyphs (photos, dark screens). */
    tone?: "dark" | "light";
    time?: string;
    className?: string;
}

/** iOS status bar: time on the left of the Dynamic Island, cellular / Wi-Fi / battery on the right. */
export const StatusBar = ({ tone = "dark", time = "9:41", className }: StatusBarProps) => {
    const color = tone === "light" ? "text-white" : "text-black dark:text-white";

    return (
        <div
            aria-hidden="true"
            className={cx("pointer-events-none absolute inset-x-0 top-0 z-[99] flex h-[54px] items-center justify-between px-[38px] pt-[8px]", color, className)}
        >
            <span className="w-[64px] text-center font-display text-[17px] leading-[22px] font-semibold tracking-[-0.4px]">{time}</span>
            <span className="flex w-[78px] items-center justify-center gap-[6px]">
                {/* Cellular */}
                <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
                    <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
                    <rect x="5" y="5" width="3.2" height="7" rx="1" />
                    <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" />
                    <rect x="15" y="0" width="3.2" height="12" rx="1" />
                </svg>
                {/* Wi-Fi */}
                <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                    <path d="M8.5 2.3c2.3 0 4.4.9 6 2.4.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4A11.2 11.2 0 0 0 .9 3.1c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0a8.6 8.6 0 0 1 6-2.4Z" />
                    <path d="M8.5 6.2c1.3 0 2.5.5 3.4 1.3.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4a7.3 7.3 0 0 0-10 0c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0 .9-.8 2.1-1.3 3.4-1.3Z" />
                    <path d="M10.9 9.4c.1-.1.1-.3 0-.4a3.4 3.4 0 0 0-4.8 0c-.1.1-.1.3 0 .4l2.2 2.2c.1.1.3.1.4 0l2.2-2.2Z" />
                </svg>
                {/* Battery */}
                <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
                    <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
                    <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
                    <path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity="0.45" />
                </svg>
            </span>
        </div>
    );
};
