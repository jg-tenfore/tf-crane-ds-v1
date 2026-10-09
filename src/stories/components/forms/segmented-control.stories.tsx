import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl, type SegmentedOption } from "@/components/base/segmented-control";
import { Caption, Panel, Specimen } from "../story-kit";

/**
 * SegmentedControl — single choice between 2–4 peers. `ios` is the classic gray track
 * with a sliding white thumb; `brand` is Crane's separated green pills ("18 Holes / 9 Holes").
 * Built on React Aria ToggleButtonGroup (arrow keys move between segments).
 */
const meta: Meta<typeof SegmentedControl> = {
    title: "Components/Forms/Segmented Control",
    component: SegmentedControl,
};
export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const Demo = ({ options, initial, variant, label }: { options: SegmentedOption[]; initial: string; variant: "ios" | "brand"; label: string }) => {
    const [value, setValue] = useState(initial);
    return (
        <div className="flex w-full flex-col gap-2">
            <SegmentedControl aria-label={label} options={options} value={value} onChange={setValue} variant={variant} />
            <Caption>value = "{value}"</Caption>
        </div>
    );
};

const HOLES = [
    { id: "18", label: "18 Holes" },
    { id: "9", label: "9 Holes" },
];

/** Classic iOS segmented control. */
export const Ios: Story = {
    name: "iOS",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-6">
            <Specimen label="2 segments" className="items-stretch">
                <Demo
                    label="Bookings"
                    variant="ios"
                    initial="upcoming"
                    options={[
                        { id: "upcoming", label: "Upcoming" },
                        { id: "past", label: "Past" },
                    ]}
                />
            </Specimen>
            <Specimen label="4 segments, one disabled" className="items-stretch">
                <Demo
                    label="Players"
                    variant="ios"
                    initial="2"
                    options={[
                        { id: "1", label: "1" },
                        { id: "2", label: "2" },
                        { id: "3", label: "3" },
                        { id: "4", label: "4", isDisabled: true },
                    ]}
                />
            </Specimen>
        </Panel>
    ),
};

/** Brand pills — tee sheet holes filter. */
export const Brand: Story = {
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-6">
            <Specimen label="Holes" className="items-stretch">
                <Demo label="Holes" variant="brand" initial="18" options={HOLES} />
            </Specimen>
            <Specimen label="Transport" className="items-stretch">
                <Demo
                    label="Transport"
                    variant="brand"
                    initial="walking"
                    options={[
                        { id: "walking", label: "Walking" },
                        { id: "cart", label: "Golf Car" },
                        { id: "pull", label: "Pull Cart", isDisabled: true },
                    ]}
                />
            </Specimen>
        </Panel>
    ),
};
