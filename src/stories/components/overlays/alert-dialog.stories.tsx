import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { AlertDialog, type AlertAction } from "@/components/feedback/alert-dialog";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { ScreenFiller } from "../story-kit";

/**
 * AlertDialog — iOS 26 alert: a Liquid Glass card with capsule buttons over a dimmed
 * scrim. 1–2 actions sit side by side; 3+ stack. It portals into the iPhone frame, so
 * it never escapes the phone. Press the button on each screen to open it.
 */
const meta: Meta<typeof AlertDialog> = {
    title: "Components/Overlays/Alert Dialog",
    component: AlertDialog,
    parameters: { phone: true },
};
export default meta;

interface DemoArgs {
    title: string;
    message?: string;
    actions: AlertAction[];
    trigger: string;
    destructiveTrigger?: boolean;
    defaultOpen?: boolean;
}
type Story = StoryObj<DemoArgs>;

const argTypes = { defaultOpen: { control: "boolean" }, actions: { control: "object" } } as const;

const Demo = ({ title, message, actions, trigger, destructiveTrigger, defaultOpen = false }: DemoArgs) => {
    const [open, setOpen] = useState(defaultOpen);
    const [last, setLast] = useState<string | null>(null);
    return (
        <Screen
            nav={<NavigationBar backLabel="Bookings" title="Reservation" />}
            footer={
                <Button fullWidth color={destructiveTrigger ? "destructive" : "filled"} onPress={() => setOpen(true)}>
                    {trigger}
                </Button>
            }
        >
            {last && <p className="px-gutter pt-3 text-ios-footnote text-tertiary">Last action: {last}</p>}
            <ScreenFiller count={4} />
            <AlertDialog
                isOpen={open}
                onOpenChange={setOpen}
                title={title}
                message={message}
                actions={actions.map((a) => ({ ...a, onPress: () => setLast(a.label) }))}
            />
        </Screen>
    );
};

/** Remount when `defaultOpen` is toggled in Controls so the alert reopens. */
const render = (args: DemoArgs) => <Demo key={String(args.defaultOpen)} {...args} />;

/** Cancel + destructive confirm, side by side. */
export const TwoActions: Story = {
    name: "Two actions",
    render,
    argTypes,
    args: {
        defaultOpen: false,
        trigger: "Delete Card",
        destructiveTrigger: true,
        title: "Delete this card?",
        message: "Visa ending in 2521 will be removed from your account.",
        actions: [
            { label: "Cancel", style: "cancel" },
            { label: "Delete", style: "destructive" },
        ],
    },
};

/** Single acknowledgement. */
export const SingleAction: Story = {
    name: "Single OK",
    render,
    argTypes,
    args: {
        defaultOpen: false,
        trigger: "Cancel Reservation",
        title: "Cannot cancel",
        message: "This tee time is in the past and cannot be cancelled.",
        actions: [{ label: "OK", style: "default" }],
    },
};

/** Three or more actions stack vertically. */
export const ThreeActions: Story = {
    name: "Three stacked actions",
    render,
    argTypes,
    args: {
        defaultOpen: false,
        trigger: "Leave Booking",
        title: "Save changes?",
        message: "You've changed the players on this reservation.",
        actions: [
            { label: "Save Changes", style: "default" },
            { label: "Discard", style: "destructive" },
            { label: "Keep Editing", style: "cancel" },
        ],
    },
};

/** Rendered open on load (controlled `isOpen`, initially true). */
export const OpenByDefault: Story = {
    name: "Open by default",
    render,
    argTypes,
    args: { ...TwoActions.args, defaultOpen: true } as DemoArgs,
};
