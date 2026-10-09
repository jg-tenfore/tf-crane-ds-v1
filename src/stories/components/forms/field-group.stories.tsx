import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldCell, FieldGroup, FieldRow } from "@/components/forms/field-group";
import { PAYMENT_CARDS } from "@/data/crane";
import { Caption, Panel } from "../story-kit";

/**
 * FieldGroup — one bordered card of stacked input cells, each with a small uppercase
 * label inside. Used for payment-card entry. Wrap cells that share a line in FieldRow.
 */
const meta: Meta<typeof FieldGroup> = {
    title: "Components/Forms/Field Group",
    component: FieldGroup,
};
export default meta;
type Story = StoryObj<typeof FieldGroup>;

/** Empty card entry form. */
export const CardEntry: Story = {
    name: "Card entry",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-2">
            <h3 className="text-ios-headline text-primary">Add Card</h3>
            <FieldGroup>
                <FieldCell label="Name on card" placeholder="Full name" autoComplete="cc-name" />
                <FieldCell label="Card number" placeholder="1234 1234 1234 1234" inputMode="numeric" autoComplete="cc-number" />
                <FieldRow>
                    <FieldCell label="Expiration" placeholder="MM / YY" inputMode="numeric" autoComplete="cc-exp" />
                    <FieldCell label="CVV" placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
                </FieldRow>
                <FieldCell label="ZIP" placeholder="12345" inputMode="numeric" autoComplete="postal-code" />
            </FieldGroup>
            <Caption>Card details are only used to cover no-show fees.</Caption>
        </Panel>
    ),
};

const card = PAYMENT_CARDS[0];

/** Pre-filled (editing a saved card). */
export const Filled: Story = {
    render: () => (
        <Panel className="w-[402px]">
            <FieldGroup>
                <FieldCell label="Name on card" defaultValue={card.name} />
                <FieldCell label="Card number" defaultValue={`•••• •••• •••• ${card.last4}`} inputMode="numeric" />
                <FieldRow>
                    <FieldCell label="Expiration" defaultValue={card.exp} inputMode="numeric" />
                    <FieldCell label="CVV" defaultValue="•••" inputMode="numeric" />
                </FieldRow>
                <FieldCell label="ZIP" defaultValue={card.zip} inputMode="numeric" />
            </FieldGroup>
        </Panel>
    ),
};
