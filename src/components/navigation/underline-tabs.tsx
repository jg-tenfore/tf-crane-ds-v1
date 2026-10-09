import type { Key, ReactNode } from "react";
import { Tab as AriaTab, TabList as AriaTabList, TabPanel as AriaTabPanel, Tabs as AriaTabs } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface UnderlineTab {
    id: string;
    label: string;
}

export interface UnderlineTabsProps {
    tabs: UnderlineTab[];
    selectedId: string;
    onChange: (id: string) => void;
    /**
     * `fill` — tabs share the width equally (Reservations / Purchases).
     * `scroll` — tabs hug their labels and scroll horizontally (Tee / Store / Activities / Clinics…).
     */
    layout?: "fill" | "scroll";
    "aria-label": string;
    /** Optional panels keyed by tab id. Omit to drive content yourself from `selectedId`. */
    panels?: Record<string, ReactNode>;
    className?: string;
}

/** Text tabs with a brand-green underline on the selected tab. Built on React Aria Tabs. */
export const UnderlineTabs = ({ tabs, selectedId, onChange, layout = "fill", panels, className, ...props }: UnderlineTabsProps) => (
    <AriaTabs selectedKey={selectedId} onSelectionChange={(k: Key) => onChange(String(k))} className={className}>
        <AriaTabList
            aria-label={props["aria-label"]}
            className={cx(
                "flex border-b border-secondary bg-primary",
                layout === "scroll" && "scrollbar-hide gap-1 overflow-x-auto px-2",
            )}
        >
            {tabs.map((t) => (
                <AriaTab
                    key={t.id}
                    id={t.id}
                    className={cx(
                        "relative flex h-[44px] cursor-pointer items-center justify-center text-ios-body whitespace-nowrap text-quaternary outline-none transition duration-100 ease-linear",
                        "data-[selected]:font-medium data-[selected]:text-brand-secondary data-[focus-visible]:ring-2 data-[focus-visible]:ring-brand-300 data-[focus-visible]:ring-inset",
                        "after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:rounded-full after:bg-transparent data-[selected]:after:bg-fg-brand-primary",
                        layout === "fill" ? "flex-1" : "px-3",
                    )}
                >
                    {t.label}
                </AriaTab>
            ))}
        </AriaTabList>
        {panels &&
            tabs.map((t) => (
                <AriaTabPanel key={t.id} id={t.id} className="outline-none">
                    {panels[t.id]}
                </AriaTabPanel>
            ))}
    </AriaTabs>
);
