import { useRef, type FC, type KeyboardEvent } from "react";
import { cx } from "@/utils/cx";
import { CountBadge } from "@/components/base/badge";

export interface TabBarItem {
    id: string;
    label: string;
    icon: FC<{ className?: string }>;
    /** Optional filled/active-state icon. Falls back to `icon`. */
    activeIcon?: FC<{ className?: string }>;
    badge?: number;
}

export interface TabBarProps {
    items: TabBarItem[];
    activeId: string;
    onChange: (id: string) => void;
    className?: string;
}

/**
 * TabBar — iOS 26 floating Liquid Glass tab bar (ported from react-cupertino-ui's
 * `floating` TabBar, re-skinned with Crane tokens). The selected tab gets a soft
 * capsule highlight and brand-green icon + label.
 *
 * Positioned absolutely at the bottom of its container (not `fixed`), so it stays
 * inside the IPhoneFrame. Arrow keys / Home / End move between tabs.
 */
export const TabBar = ({ items, activeId, onChange, className }: TabBarProps) => {
    const refs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeIndex = Math.max(0, items.findIndex((i) => i.id === activeId));

    const onKeyDown = (e: KeyboardEvent) => {
        const last = items.length - 1;
        const next =
            e.key === "ArrowRight" ? (activeIndex + 1) % items.length
            : e.key === "ArrowLeft" ? (activeIndex - 1 + items.length) % items.length
            : e.key === "Home" ? 0
            : e.key === "End" ? last
            : -1;
        if (next < 0) return;
        e.preventDefault();
        onChange(items[next].id);
        refs.current[next]?.focus();
    };

    return (
        <nav aria-label="App navigation" className={cx("pointer-events-none absolute inset-x-0 bottom-[22px] z-40 flex justify-center", className)}>
            <div role="tablist" onKeyDown={onKeyDown} className="glass pointer-events-auto flex h-[62px] items-center gap-0.5 rounded-full p-[4px]">
                {items.map((item, i) => {
                    const selected = item.id === activeId;
                    const Icon = selected && item.activeIcon ? item.activeIcon : item.icon;
                    return (
                        <button
                            key={item.id}
                            ref={(el) => {
                                refs.current[i] = el;
                            }}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => onChange(item.id)}
                            className={cx(
                                "relative flex h-full w-[86px] cursor-pointer flex-col items-center justify-center gap-[2px] rounded-full outline-none transition duration-200 ease-ios focus-visible:ring-4 focus-visible:ring-brand-300/60 active:scale-95",
                                selected ? "bg-black/[0.07] text-fg-brand-primary dark:bg-white/10" : "text-primary",
                            )}
                        >
                            <span className="relative">
                                <Icon className="size-[24px]" aria-hidden="true" />
                                {item.badge ? <CountBadge count={item.badge} className="absolute -top-2 -right-3.5 ring-2 ring-white dark:ring-gray-900" /> : null}
                            </span>
                            <span className="text-[10px] leading-[12px] font-semibold">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
