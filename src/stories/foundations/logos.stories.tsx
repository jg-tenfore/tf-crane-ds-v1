import type { Meta, StoryObj } from "@storybook/react-vite";
import { BRAND_ASSETS, CraneAppIcon, CraneLockup, TfLogo } from "@/components/foundations/logos";

/**
 * TF Crane is a TenFore Golf product. The **Crane app icon** (green line-art crane in a
 * ring) is the product mark; the **TenFore Golf** logo is the parent brand, used for
 * "Powered by" lockups and auth screens. Source files: `crane-logo/` and `brand/`.
 */
const meta = {
    title: "Foundations/Logos",
    parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Tile = ({ label, file, dark, children }: { label: string; file: string; dark?: boolean; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
        <div className={`flex h-[180px] items-center justify-center rounded-ios-card ring-1 ring-secondary ${dark ? "bg-gray-950" : "bg-primary"}`}>{children}</div>
        <div className="text-ios-subheadline font-semibold text-primary">{label}</div>
        <code className="font-mono text-ios-caption1 text-tertiary">{file}</code>
    </div>
);

export const CraneAppIcons: Story = {
    name: "Crane app icon",
    render: () => (
        <div className="min-h-screen bg-secondary p-10 font-body">
            <h1 className="text-ios-title1 text-primary">Crane app icon</h1>
            <p className="mt-1 text-ios-subheadline text-tertiary">iOS squircle mask applied in code (corner radius = 22.37% of the edge).</p>
            <div className="mt-8 flex items-end gap-10">
                {[180, 120, 88, 64, 40, 29].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <CraneAppIcon size={s} />
                        <span className="text-ios-caption1 text-tertiary">{s}pt</span>
                    </div>
                ))}
            </div>
            <div className="mt-12 grid max-w-[900px] grid-cols-3 gap-6">
                <Tile label="Lockup" file="CraneLockup">
                    <CraneLockup size={72} />
                </Tile>
                <Tile label="Raw asset (webp)" file={BRAND_ASSETS.craneIcon}>
                    <CraneAppIcon size={120} masked={false} />
                </Tile>
                <Tile label="On dark" file="CraneAppIcon" dark>
                    <CraneAppIcon size={96} />
                </Tile>
            </div>
        </div>
    ),
};

export const TenForeGolf: Story = {
    name: "TenFore Golf",
    render: () => (
        <div className="min-h-screen bg-secondary p-10 font-body">
            <h1 className="text-ios-title1 text-primary">TenFore Golf</h1>
            <div className="mt-8 grid max-w-[900px] grid-cols-3 gap-6">
                <Tile label="Wordmark · color" file={BRAND_ASSETS.tfLogo}>
                    <TfLogo height={40} />
                </Tile>
                <Tile label="Wordmark · black" file={BRAND_ASSETS.tfLogoBlack}>
                    <TfLogo tone="black" height={40} />
                </Tile>
                <Tile label="Wordmark · white" file={BRAND_ASSETS.tfLogoWhite} dark>
                    <TfLogo tone="white" height={40} />
                </Tile>
                <Tile label="Mark · color" file={BRAND_ASSETS.tfSquareColor}>
                    <TfLogo variant="mark" height={72} />
                </Tile>
                <Tile label="Mark · black" file={BRAND_ASSETS.tfSquareBlack}>
                    <TfLogo variant="mark" tone="black" height={72} />
                </Tile>
                <Tile label="Mark · white" file={BRAND_ASSETS.tfSquareWhite} dark>
                    <TfLogo variant="mark" tone="white" height={72} />
                </Tile>
            </div>
        </div>
    ),
};
