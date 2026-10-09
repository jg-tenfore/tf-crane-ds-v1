import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChoiceChips, RadioCardGroup, type RadioCardOption } from "@/components/forms/choice";
import { Caption, Panel } from "../story-kit";

/**
 * Choice controls. **RadioCardGroup** — stacked full-width radio rows, the selected one
 * tints green ("Walking / Golf Car"). **ChoiceChips** — round number chips ("Number of
 * Players: 1 2 3 4"). Both built on React Aria (RadioGroup / ToggleButtonGroup).
 */
const meta: Meta<typeof RadioCardGroup> = {
    title: "Components/Forms/Choice",
    component: RadioCardGroup,
};
export default meta;
type Story = StoryObj<typeof RadioCardGroup>;

const Radios = ({ label, options, initial }: { label?: string; options: RadioCardOption[]; initial: string }) => {
    const [value, setValue] = useState(initial);
    return (
        <Panel className="flex w-[402px] flex-col gap-3 bg-primary ring-1 ring-secondary">
            <RadioCardGroup label={label} options={options} value={value} onChange={setValue} />
            <Caption>value = "{value}"</Caption>
        </Panel>
    );
};

/** Transport choice on the booking screen. */
export const RadioCards: Story = {
    name: "RadioCardGroup",
    render: () => (
        <Radios
            label="Transportation"
            initial="walking"
            options={[
                { id: "walking", label: "Walking" },
                { id: "cart", label: "Golf Car", detail: "$26.00" },
            ]}
        />
    ),
};

/** With descriptions and a disabled option. */
export const RadioCardsDetailed: Story = {
    name: "RadioCardGroup · descriptions & disabled",
    render: () => (
        <Radios
            label="Rate"
            initial="resident"
            options={[
                { id: "resident", label: "Weekend Resident", description: "Proof of residency at check-in", detail: "$45.00" },
                { id: "non-resident", label: "Weekend Non Resident", detail: "$53.00" },
                { id: "twilight", label: "Twilight", description: "Available after 3 PM", detail: "$30.00", isDisabled: true },
            ]}
        />
    ),
};

const Chips = ({ disableFrom }: { disableFrom?: number }) => {
    const [value, setValue] = useState("1");
    return (
        <Panel className="flex w-[402px] flex-col gap-3 bg-primary ring-1 ring-secondary">
            <div className="text-ios-headline text-primary">Number of Players</div>
            <ChoiceChips
                aria-label="Number of players"
                value={value}
                onChange={setValue}
                options={[1, 2, 3, 4].map((n) => ({ id: String(n), label: n, isDisabled: disableFrom ? n >= disableFrom : false }))}
            />
            <Caption>value = "{value}"</Caption>
        </Panel>
    );
};

/** Players 1–4. */
export const PlayerChips: Story = { name: "ChoiceChips", render: () => <Chips /> };

/** Only 2 spots left on this tee time → 3 and 4 disabled. */
export const PlayerChipsLimited: Story = { name: "ChoiceChips · limited spots", render: () => <Chips disableFrom={3} /> };
