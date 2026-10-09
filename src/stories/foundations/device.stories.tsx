import type { Meta, StoryObj } from "@storybook/react-vite";
import { IPHONE_17, IPhoneFrame } from "@/components/device/iphone-frame";
import { NAV_CHROME_HEIGHT, TAB_BAR_CHROME_HEIGHT } from "@/components/device/screen";

/**
 * Every Crane screen is designed at **iPhone 17: 402 × 874 pt** (1206 × 2622 px @3x —
 * the size of the reference screenshots). This page documents the safe areas and
 * chrome heights that `Screen` uses to lay content out.
 */
const meta = {
    title: "Foundations/Device",
    parameters: { layout: "centered" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Band = ({ top, height, label, tone }: { top: number; height: number; label: string; tone: string }) => (
    <div className={`absolute inset-x-0 flex items-center justify-end pr-3 ${tone}`} style={{ top, height }}>
        <span className="rounded bg-white/85 px-1.5 py-0.5 font-mono text-[11px] text-gray-900">{label}</span>
    </div>
);

export const SafeAreas: Story = {
    name: "Safe areas & chrome",
    render: () => (
        <div className="flex items-center gap-12 font-body">
            <IPhoneFrame>
                <div className="absolute inset-0 bg-secondary">
                    <Band top={0} height={IPHONE_17.safeTop} label={`safe top ${IPHONE_17.safeTop}`} tone="bg-error-solid/25" />
                    <Band top={IPHONE_17.safeTop} height={54} label="nav bar 54" tone="bg-warning-solid/25" />
                    <div className="absolute inset-x-[16px] border-x border-dashed border-brand" style={{ top: NAV_CHROME_HEIGHT, bottom: TAB_BAR_CHROME_HEIGHT }}>
                        <div className="flex h-full items-center justify-center font-mono text-[11px] text-brand-secondary">content · gutter 16</div>
                    </div>
                    <Band top={IPHONE_17.height - TAB_BAR_CHROME_HEIGHT} height={TAB_BAR_CHROME_HEIGHT - IPHONE_17.safeBottom} label="tab bar zone" tone="bg-brand-solid/20" />
                    <Band top={IPHONE_17.height - IPHONE_17.safeBottom} height={IPHONE_17.safeBottom} label={`safe bottom ${IPHONE_17.safeBottom}`} tone="bg-error-solid/25" />
                </div>
            </IPhoneFrame>
            <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-2 text-ios-subheadline">
                {[
                    ["Logical size", `${IPHONE_17.width} × ${IPHONE_17.height} pt`],
                    ["Pixel size (@3x)", "1206 × 2622 px"],
                    ["Display corner radius", `${IPHONE_17.cornerRadius} pt`],
                    ["Safe area · top", `${IPHONE_17.safeTop} pt`],
                    ["Safe area · bottom", `${IPHONE_17.safeBottom} pt`],
                    ["Dynamic Island", `${IPHONE_17.island.width} × ${IPHONE_17.island.height} pt @ y ${IPHONE_17.island.top}`],
                    ["Nav chrome (status + bar)", `${NAV_CHROME_HEIGHT} pt`],
                    ["Tab bar reserve", `${TAB_BAR_CHROME_HEIGHT} pt`],
                    ["Layout gutter", "16 pt"],
                ].map(([k, v]) => (
                    <div key={k} className="contents">
                        <dt className="text-tertiary">{k}</dt>
                        <dd className="font-semibold text-primary tabular-nums">{v}</dd>
                    </div>
                ))}
            </dl>
        </div>
    ),
};

export const Frames: Story = {
    name: "Frame variants",
    render: () => (
        <div className="flex items-start gap-10">
            <IPhoneFrame>
                <div className="flex h-full items-center justify-center text-ios-headline text-tertiary">variant="device"</div>
            </IPhoneFrame>
            <IPhoneFrame variant="bare">
                <div className="flex h-full items-center justify-center text-ios-headline text-tertiary">variant="bare"</div>
            </IPhoneFrame>
            <IPhoneFrame dark statusBar="light">
                <div className="flex h-full items-center justify-center text-ios-headline text-tertiary">dark</div>
            </IPhoneFrame>
        </div>
    ),
};
