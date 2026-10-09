import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "@/components/feedback/empty-state";
import { UnderlineTabs, type UnderlineTab } from "@/components/navigation/underline-tabs";
import { COURSE_SECTIONS } from "@/data/crane";
import { Calendar, ShoppingBag01 } from "@untitledui/icons";
import { Caption, Panel } from "../story-kit";

/**
 * UnderlineTabs — text tabs with a brand-green underline. `fill` splits the width
 * (Bookings: Reservations / Purchases); `scroll` hugs labels and scrolls sideways
 * (course sections). Built on React Aria Tabs (arrow keys, focus ring).
 */
const meta: Meta<typeof UnderlineTabs> = {
    title: "Components/Navigation/Underline Tabs",
    component: UnderlineTabs,
};
export default meta;
type Story = StoryObj<typeof UnderlineTabs>;

const Demo = ({ tabs, layout, label, withPanels }: { tabs: UnderlineTab[]; layout: "fill" | "scroll"; label: string; withPanels?: boolean }) => {
    const [selected, setSelected] = useState(tabs[0].id);
    return (
        <Panel className="flex w-[402px] flex-col gap-3 overflow-hidden px-0 pt-0">
            <UnderlineTabs
                aria-label={label}
                tabs={tabs}
                selectedId={selected}
                onChange={setSelected}
                layout={layout}
                panels={
                    withPanels
                        ? {
                              reservations: <EmptyState icon={Calendar} title="No upcoming reservations" />,
                              purchases: <EmptyState icon={ShoppingBag01} title="No purchases yet" />,
                          }
                        : undefined
                }
            />
            <Caption className="px-6">selectedId = "{selected}"</Caption>
        </Panel>
    );
};

const BOOKING_TABS = [
    { id: "reservations", label: "Reservations" },
    { id: "purchases", label: "Purchases" },
];

/** Equal-width tabs (Bookings). */
export const Fill: Story = { render: () => <Demo label="Bookings" layout="fill" tabs={BOOKING_TABS} /> };

/** Horizontally scrolling course sections from `COURSE_SECTIONS`. */
export const Scroll: Story = { render: () => <Demo label="Course sections" layout="scroll" tabs={COURSE_SECTIONS} /> };

/** With `panels` — React Aria renders the selected panel. */
export const WithPanels: Story = { name: "With panels", render: () => <Demo label="Bookings" layout="fill" tabs={BOOKING_TABS} withPanels /> };
