import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeField } from "@/components/forms/code-field";
import { Caption, Panel } from "../story-kit";

/**
 * CodeField — one-time code entry for email / SMS verification. One real input sits
 * under the boxes, so paste, `one-time-code` autofill and backspace work natively.
 */
const meta: Meta<typeof CodeField> = {
    title: "Components/Forms/Code Field",
    component: CodeField,
    tags: ["autodocs"],
    args: { length: 6, isInvalid: false },
    argTypes: { length: { control: { type: "number", min: 4, max: 8 } } },
    render: (args) => (
        <Panel className="w-[402px]">
            <CodeField {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof CodeField>;

export const Empty: Story = {};

export const PartiallyFilled: Story = { name: "Partially filled", args: { value: "482" } };

export const Invalid: Story = {
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-2">
            <CodeField value="482193" isInvalid />
            <div className="text-ios-footnote text-error-primary">That code didn't match. Try again or resend.</div>
        </Panel>
    ),
};

export const FourDigits: Story = { name: "4 digits", args: { length: 4, value: "07" } };

const Verify = () => {
    const [done, setDone] = useState<string | null>(null);
    return (
        <Panel className="flex w-[402px] flex-col gap-3">
            <div>
                <div className="text-ios-title3 text-primary">Enter verification code</div>
                <div className="text-ios-subheadline text-tertiary">Sent to justin.girard@tenfore.golf</div>
            </div>
            <CodeField onChange={() => setDone(null)} onComplete={setDone} />
            <Caption>{done ? `onComplete("${done}")` : "Type 6 digits…"}</Caption>
        </Panel>
    );
};

/** Type or paste a code; `onComplete` fires when every box is filled. */
export const Interactive: Story = { render: () => <Verify /> };
