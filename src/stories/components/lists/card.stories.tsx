import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Award02, Calendar, CreditCard02, Receipt, User01, Users01, Wallet02 } from "@untitledui/icons";
import { Button } from "@/components/base/button";
import { Card, Divider, IconTile, Section, type IconTileProps } from "@/components/base/card";
import { KeyValueRow } from "@/components/lists/list";
import { Caption, Panel, Specimen } from "../story-kit";

/**
 * Card — the white rounded surface on grouped gray, the basic Crane container.
 * **Section** titles a block of content on a screen; **IconTile** is the soft tinted
 * square/circle holding a line icon; **Divider** is the hairline between rows.
 */
const meta: Meta<typeof Card> = {
    title: "Components/Lists & Cards/Card",
    component: Card,
    tags: ["autodocs"],
    args: { padding: "md" },
    argTypes: { padding: { control: "inline-radio", options: ["none", "md", "lg"] } },
    render: (args) => (
        <Panel className="w-[402px]">
            <Card {...args}>
                <div className="text-ios-headline text-primary">Sagamore Hampton Golf Club</div>
                <div className="text-ios-subheadline text-tertiary">101 North Road, North Hampton, NH</div>
            </Card>
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

/** `none` for cards that hold their own rows, `md` (16pt) default, `lg` (20pt) for roomy summaries. */
export const Paddings: Story = {
    render: () => (
        <Panel className="flex w-[402px] flex-col gap-4">
            {(["none", "md", "lg"] as const).map((p) => (
                <Specimen key={p} label={`padding="${p}"`} className="items-stretch">
                    <Card padding={p}>
                        <div className="rounded-md bg-brand-primary px-2 py-1 text-ios-subheadline text-brand-secondary">Content area</div>
                    </Card>
                </Specimen>
            ))}
        </Panel>
    ),
};

/** Sections with a brand icon and an optional right-aligned accessory. */
export const Sections: Story = {
    render: () => (
        <div className="w-[402px] space-y-6 rounded-3xl bg-secondary py-6">
            <Section title="Date & Time" icon={Calendar} accessory={<Button size="sm" color="plain">Change</Button>}>
                <Card>
                    <div className="text-ios-title3 text-primary">Sun, Oct 11 · 9:03 AM</div>
                    <div className="text-ios-subheadline text-tertiary">18 holes · Walking</div>
                </Card>
            </Section>
            <Section title="Players (2)" icon={Users01}>
                <Card padding="none">
                    <div className="px-4 py-3 text-ios-body text-primary">Justin Girard</div>
                    <Divider inset={16} />
                    <div className="px-4 py-3 text-ios-body text-primary">Mike Callahan</div>
                </Card>
            </Section>
            <Section title="Order Summary" icon={Receipt}>
                <Card className="py-1">
                    <KeyValueRow label="Weekend Non Resident ×2" value="$106.00" />
                    <Divider />
                    <KeyValueRow label="Total" value="$106.00" tone="emphasis" />
                </Card>
            </Section>
        </div>
    ),
};

const TILE_ICON = { brand: Award02, gray: Wallet02, error: AlertTriangle, warning: AlertTriangle } as const;

/** IconTile on its own — try the controls. */
export const IconTilePlayground: StoryObj<IconTileProps> = {
    name: "IconTile playground",
    args: { size: "md", shape: "rounded", tone: "brand" },
    argTypes: {
        size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
        shape: { control: "inline-radio", options: ["rounded", "circle"] },
        tone: { control: "inline-radio", options: ["brand", "gray", "error", "warning"] },
        icon: { control: false },
    },
    render: (args) => (
        <Panel>
            <IconTile {...args} icon={User01} />
        </Panel>
    ),
};

/** Sizes × tones, rounded and circle. */
export const IconTiles: Story = {
    name: "IconTile sizes, shapes & tones",
    render: () => (
        <Panel className="flex flex-col gap-6">
            {(["rounded", "circle"] as const).map((shape) => (
                <div key={shape} className="grid grid-cols-[64px_repeat(4,80px)] items-center gap-y-4">
                    <Caption>{shape}</Caption>
                    {(["sm", "md", "lg", "xl"] as const).map((s) => (
                        <Caption key={s}>{s}</Caption>
                    ))}
                    {(["brand", "gray", "error", "warning"] as const).map((tone) => (
                        <div key={tone} className="contents">
                            <Caption>{tone}</Caption>
                            {(["sm", "md", "lg", "xl"] as const).map((s) => (
                                <div key={s}>
                                    <IconTile
                                        icon={TILE_ICON[tone]}
                                        size={s}
                                        shape={shape}
                                        tone={tone}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </Panel>
    ),
};

/** Full-bleed and inset dividers (inset aligns with the text column after an icon). */
export const Dividers: Story = {
    render: () => (
        <Panel className="w-[402px]">
            <Card padding="none">
                <div className="px-4 py-3 text-ios-body text-primary">Full-bleed below</div>
                <Divider />
                <div className="px-4 py-3 text-ios-body text-primary">Inset 16 below</div>
                <Divider inset={16} />
                <div className="flex items-center gap-3 px-4 py-3">
                    <IconTile icon={User01} />
                    <span className="text-ios-body text-primary">Inset 68 below (icon rows)</span>
                </div>
                <Divider inset={68} />
                <div className="flex items-center gap-3 px-4 py-3">
                    <IconTile icon={CreditCard02} />
                    <span className="text-ios-body text-primary">Payment Methods</span>
                </div>
            </Card>
        </Panel>
    ),
};
