import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { buildDays, DateStrip, type DateStripDay } from "@/components/navigation/date-strip";
import { Caption, Panel } from "../story-kit";

/**
 * DateStrip — horizontally scrolling day picker above the tee sheet. The selected
 * day is solid brand green. `buildDays(start, count)` builds consecutive local days.
 */
const meta: Meta<typeof DateStrip> = {
    title: "Components/Navigation/Date Strip",
    component: DateStrip,
};
export default meta;
type Story = StoryObj<typeof DateStrip>;

const DAYS = buildDays(new Date(2026, 9, 9));

const Demo = ({ days, initial }: { days: DateStripDay[]; initial?: string }) => {
    const [selected, setSelected] = useState(initial ?? days[0].id);
    return (
        <Panel className="flex w-[402px] flex-col gap-2 px-0">
            <DateStrip days={days} selectedId={selected} onChange={setSelected} />
            <Caption className="px-6">selectedId = "{selected}"</Caption>
        </Panel>
    );
};

/** Two weeks from Fri, Oct 9 2026; today selected. */
export const Default: Story = { render: () => <Demo days={DAYS} /> };

/** A later day selected. */
export const LaterDay: Story = { name: "Later day selected", render: () => <Demo days={DAYS} initial={DAYS[2].id} /> };

/** Days outside the booking window are disabled. */
export const WithDisabledDays: Story = {
    name: "With disabled days",
    render: () => <Demo days={DAYS.map((d, i) => ({ ...d, isDisabled: i > 2 }))} />,
};
