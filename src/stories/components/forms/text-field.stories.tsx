import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lock01, Mail01, Phone, User01 } from "@untitledui/icons";
import { TextField } from "@/components/forms/text-field";
import { Panel } from "../story-kit";

/**
 * TextField — label above a white rounded 50pt field, optional leading icon, hint,
 * error message and a show/hide toggle for passwords. Matches Crane's Edit Profile
 * fields. Built on React Aria TextField.
 */
const meta: Meta<typeof TextField> = {
    title: "Components/Forms/Text Field",
    component: TextField,
    tags: ["autodocs"],
    args: { label: "Email", placeholder: "you@example.com", isDisabled: false, isInvalid: false, isRequired: false },
    argTypes: { icon: { control: false }, trailing: { control: false }, hint: { control: "text" } },
    render: (args) => (
        <Panel className="w-[402px]">
            <TextField {...args} />
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {};

export const WithIcon: Story = { name: "With icon", args: { icon: Mail01, defaultValue: "justin.girard@tenfore.golf" } };

export const WithHint: Story = {
    name: "With hint",
    args: { label: "Mobile Number", icon: Phone, placeholder: "(555) 555-0100", type: "tel", hint: "We'll text tee time reminders to this number." },
};

export const Invalid: Story = {
    args: { icon: Mail01, defaultValue: "justin.girard@", isInvalid: true, errorMessage: "Enter a valid email address." },
};

export const Disabled: Story = { args: { label: "First Name", icon: User01, defaultValue: "Justin", isDisabled: true } };

export const Password: Story = {
    name: "Password (revealable)",
    args: { label: "Password", icon: Lock01, placeholder: "Password", revealable: true, defaultValue: "teetime2026", isRequired: true, hint: "At least 8 characters." },
};

/** A small Edit Profile form. */
export const Form: Story = {
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-4">
            <TextField label="First Name" icon={User01} defaultValue="Justin" />
            <TextField label="Last Name" icon={User01} defaultValue="Girard" />
            <TextField label="Email" icon={Mail01} type="email" defaultValue="justin.girard@tenfore.golf" isRequired />
            <TextField label="Mobile Number" icon={Phone} type="tel" defaultValue="(617) 555-0142" />
        </Panel>
    ),
};
