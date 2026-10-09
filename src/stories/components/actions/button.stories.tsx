import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Calendar, Plus, Trash01 } from "@untitledui/icons";
import { Button, buttonStyles, type ButtonColor, type ButtonSize } from "@/components/base/button";
import { Card, Section } from "@/components/base/card";
import { Screen } from "@/components/device/screen";
import { KeyValueRow } from "@/components/lists/list";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { Caption, Panel, Specimen } from "../story-kit";

const COLORS = Object.keys(buttonStyles.colors) as ButtonColor[];
const SIZES = Object.keys(buttonStyles.sizes) as ButtonSize[];

/**
 * Button — Crane's capsule/rounded iOS buttons. One `filled` primary per screen;
 * `outline` for Cancel / Back in sheet footers; `plain` for text links; `destructive`
 * only for irreversible confirmations. Built on React Aria Button (press, not click).
 */
const meta: Meta<typeof Button> = {
    title: "Components/Actions/Button",
    component: Button,
    tags: ["autodocs"],
    args: { children: "Book Tee Time", color: "filled", size: "lg", fullWidth: false, isLoading: false, isDisabled: false },
    argTypes: {
        color: { control: "select", options: COLORS },
        size: { control: "inline-radio", options: SIZES },
        iconLeading: { control: false },
        iconTrailing: { control: false },
        children: { control: "text" },
    },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

/** Every color at every size. `lg` (50pt) is the default full-width action size. */
export const ColorsAndSizes: Story = {
    name: "Colors × sizes",
    render: () => (
        <Panel>
            <div className="grid grid-cols-[120px_repeat(3,auto)] items-center gap-x-6 gap-y-4">
                <span />
                {SIZES.map((s) => (
                    <Caption key={s}>{s}</Caption>
                ))}
                {COLORS.map((c) => (
                    <div key={c} className="contents">
                        <Caption>{c}</Caption>
                        {SIZES.map((s) => (
                            <div key={s}>
                                <Button color={c} size={s}>
                                    {c.includes("destructive") ? "Delete" : "Continue"}
                                </Button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Panel>
    ),
};

/** Icons are passed as component refs and sized by the button. */
export const WithIcons: Story = {
    name: "With icons",
    render: () => (
        <Panel className="flex flex-col gap-4">
            <Specimen label="iconTrailing">
                <Button iconTrailing={ArrowRight}>Continue</Button>
            </Specimen>
            <Specimen label="iconLeading">
                <Button color="tinted" iconLeading={Calendar}>
                    Add to Calendar
                </Button>
            </Specimen>
            <Specimen label="sm · gray · iconLeading">
                <Button size="sm" color="gray" iconLeading={Plus}>
                    Add Player
                </Button>
            </Specimen>
            <Specimen label="plain-destructive · iconLeading">
                <Button color="plain-destructive" iconLeading={Trash01}>
                    Remove Card
                </Button>
            </Specimen>
        </Panel>
    ),
};

/** `isLoading` swaps the leading icon for a spinner and disables the button. */
export const Loading: Story = {
    render: () => (
        <Panel className="flex flex-col gap-4">
            {(["filled", "tinted", "outline", "black"] as ButtonColor[]).map((c) => (
                <Specimen key={c} label={c}>
                    <Button color={c} isLoading>
                        Processing…
                    </Button>
                </Specimen>
            ))}
        </Panel>
    ),
};

/** Disabled buttons drop to 50% opacity (never a separate grey token). */
export const Disabled: Story = {
    render: () => (
        <Panel className="grid grid-cols-3 gap-4">
            {COLORS.map((c) => (
                <Specimen key={c} label={c}>
                    <Button color={c} size="md" isDisabled>
                        Continue
                    </Button>
                </Specimen>
            ))}
        </Panel>
    ),
};

/** `fullWidth` — most iOS primary actions stretch to the gutter. */
export const FullWidth: Story = {
    name: "Full width",
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-3">
            <Button fullWidth iconTrailing={ArrowRight}>
                Continue
            </Button>
            <Button fullWidth color="outline">
                Cancel
            </Button>
            <Button fullWidth color="black">
                Add to Apple Wallet
            </Button>
        </Panel>
    ),
};

/** A screen footer: secondary action on the left, the one primary action on the right. */
export const InContext: Story = {
    name: "In context",
    parameters: { phone: true },
    render: () => (
        <Screen
            nav={<NavigationBar backLabel="Tee Times" title="Tee Time Details" titleTone="brand" />}
            footer={
                <div className="glass flex gap-3 rounded-[28px] p-2">
                    <Button color="outline" className="flex-1">
                        Cancel
                    </Button>
                    <Button className="flex-1" iconTrailing={ArrowRight}>
                        Continue
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 pt-4">
                <Section title="Date & Time" icon={Calendar}>
                    <Card>
                        <div className="text-ios-title2 text-primary">Sun, Oct 11 · 9:03 AM</div>
                        <div className="text-ios-subheadline text-tertiary">Sagamore Hampton Golf Club · 18 holes</div>
                    </Card>
                </Section>
                <Section title="Order Summary">
                    <Card className="divide-y divide-border-secondary py-1">
                        <KeyValueRow label="Weekend Non Resident" value="$53.00" />
                        <KeyValueRow label="Golf Car" value="$26.00" />
                        <KeyValueRow label="Total" value="$79.00" tone="emphasis" />
                    </Card>
                </Section>
            </div>
        </Screen>
    ),
};
