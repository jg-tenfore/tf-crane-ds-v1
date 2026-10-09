import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "@/components/base/switch";
import { Caption, Panel, Specimen } from "../story-kit";

/**
 * Switch — the iOS 51 × 31pt toggle in brand green. The label is optional: list rows
 * usually supply the text and pass an `aria-label` instead. Built on React Aria Switch.
 */
const meta: Meta<typeof Switch> = {
    title: "Components/Forms/Switch",
    component: Switch,
    tags: ["autodocs"],
    args: { children: "Push notifications", isDisabled: false, defaultSelected: true },
    argTypes: { children: { control: "text" } },
    render: (args) => (
        <Panel>
            <Switch {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

/** Off / on, enabled / disabled, and label-less (row) usage. */
export const States: Story = {
    render: () => (
        <Panel className="grid grid-cols-2 gap-x-10 gap-y-5">
            <Specimen label="Off">
                <Switch aria-label="Off" />
            </Specimen>
            <Specimen label="On">
                <Switch aria-label="On" defaultSelected />
            </Specimen>
            <Specimen label="Disabled · off">
                <Switch aria-label="Disabled off" isDisabled />
            </Specimen>
            <Specimen label="Disabled · on">
                <Switch aria-label="Disabled on" isDisabled defaultSelected />
            </Specimen>
            <Specimen label="With label" className="col-span-2">
                <Switch defaultSelected>Email receipts</Switch>
            </Specimen>
        </Panel>
    ),
};

const Controlled = () => {
    const [on, setOn] = useState(false);
    return (
        <Panel className="flex w-[402px] flex-col gap-3">
            <div className="flex items-center justify-between rounded-ios-card bg-primary px-4 py-3 shadow-ios-card">
                <span className="text-ios-body text-primary">Tee time reminders</span>
                <Switch aria-label="Tee time reminders" isSelected={on} onChange={setOn} />
            </div>
            <Caption>isSelected = {String(on)}</Caption>
        </Panel>
    );
};

/** Controlled with useState, inside a settings-style row. */
export const Interactive: Story = { render: () => <Controlled /> };
