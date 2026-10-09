import type { Meta, StoryObj } from "@storybook/react-vite";
import { QRCode } from "@/components/base/qr-code";
import { Card } from "@/components/base/card";
import { Caption, Panel, Specimen } from "../story-kit";

/**
 * QRCode — a scannable code drawn as one SVG path (kiosk sign-in, check-in pass).
 * Always render it on white with a quiet zone: it stays black in dark mode on purpose.
 */
const meta: Meta<typeof QRCode> = {
    title: "Components/Media/QR Code",
    component: QRCode,
    tags: ["autodocs"],
    args: { value: "https://crane.tenfore.golf/checkin/b-1", size: 220 },
    argTypes: { size: { control: { type: "range", min: 96, max: 320, step: 4 } } },
    render: (args) => (
        <Panel>
            <div className="rounded-ios-card bg-white p-4">
                <QRCode {...args} />
            </div>
        </Panel>
    ),
};
export default meta;
type Story = StoryObj<typeof QRCode>;

export const Playground: Story = {};

/** Common sizes. */
export const Sizes: Story = {
    render: () => (
        <Panel className="flex items-end gap-6">
            {[96, 160, 220].map((s) => (
                <Specimen key={s} label={`size={${s}}`}>
                    <div className="rounded-ios-control bg-white p-2">
                        <QRCode value="https://crane.tenfore.golf/checkin/b-1" size={s} />
                    </div>
                </Specimen>
            ))}
        </Panel>
    ),
};

/** Check-in pass: the code with its booking context. */
export const CheckInPass: Story = {
    name: "Check-in pass",
    render: () => (
        <Panel className="w-[402px]">
            <Card padding="lg" className="flex flex-col items-center text-center">
                <div className="text-ios-headline text-primary">Sagamore Hampton Golf Club</div>
                <div className="text-ios-subheadline text-tertiary">Sun, Oct 11 · 9:03 AM · 1 player</div>
                <div className="my-5 rounded-ios-control bg-white p-3 ring-1 ring-secondary">
                    <QRCode value="crane://checkin/b-1?course=sagamore-hampton" size={200} />
                </div>
                <Caption>Show this code at the pro shop to check in.</Caption>
            </Card>
        </Panel>
    ),
};
