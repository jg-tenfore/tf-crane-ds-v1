import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, XClose } from "@untitledui/icons";
import { BackButton, GlassIconButton, GlassPillButton } from "@/components/base/glass-button";

/**
 * Liquid Glass is iOS 26's material for floating chrome — the tab bar, nav-bar
 * buttons, alerts and sheets. It's a translucent surface with a background blur,
 * saturation boost, bright inner rim and soft drop shadow. Values are ported from
 * react-cupertino-ui's glass mixin and live in `src/styles/cupertino.css`.
 *
 * Rule: glass is for chrome that floats *over* content. Content itself (cards,
 * lists) stays on solid `bg-primary` so text contrast never depends on what's behind it.
 */
const meta = {
    title: "Foundations/Liquid Glass",
    parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const Backdrop = ({ children }: { children: React.ReactNode }) => (
    <div
        className="relative flex min-h-[420px] flex-wrap items-center justify-center gap-8 overflow-hidden p-10"
        style={{
            background:
                "radial-gradient(circle at 20% 30%, #3EA563 0, transparent 40%), radial-gradient(circle at 80% 20%, #F5B544 0, transparent 35%), radial-gradient(circle at 60% 80%, #1F2A3F 0, transparent 45%), #e9efe9",
        }}
    >
        {/* Stripes make the blur obvious. */}
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(45deg, #fff 0 10px, transparent 10px 24px)" }} />
        {children}
    </div>
);

export const Surfaces: Story = {
    render: () => (
        <div className="bg-primary font-body">
            <Backdrop>
                <div className="glass relative flex h-[140px] w-[220px] flex-col justify-end rounded-ios-card p-4">
                    <code className="font-mono text-ios-footnote">glass</code>
                    <span className="text-ios-caption1 text-secondary">surface 72% · blur 24 · sat 180%</span>
                </div>
                <div className="glass-strong relative flex h-[140px] w-[220px] flex-col justify-end rounded-ios-card p-4">
                    <code className="font-mono text-ios-footnote">glass-strong</code>
                    <span className="text-ios-caption1 text-secondary">surface 90% — alerts, dense text</span>
                </div>
                <div className="relative flex h-[140px] w-[220px] flex-col justify-end rounded-ios-card bg-primary p-4 shadow-ios-card">
                    <code className="font-mono text-ios-footnote">bg-primary</code>
                    <span className="text-ios-caption1 text-secondary">solid — content cards (not glass)</span>
                </div>
            </Backdrop>
        </div>
    ),
};

export const Controls: Story = {
    render: () => (
        <div className="bg-primary font-body">
            <Backdrop>
                <BackButton label="Profile" />
                <BackButton />
                <GlassIconButton icon={Plus} aria-label="Add" />
                <GlassIconButton icon={XClose} aria-label="Close" />
                <GlassPillButton>Join</GlassPillButton>
            </Backdrop>
        </div>
    ),
};

export const Tokens: Story = {
    render: () => (
        <div className="min-h-screen bg-primary p-10 font-body">
            <h1 className="text-ios-title1 text-primary">Glass tokens</h1>
            <table className="mt-6 w-full max-w-[760px] text-left text-ios-subheadline">
                <thead className="text-ios-footnote text-tertiary">
                    <tr>
                        <th className="py-2">Variable</th>
                        <th>Light</th>
                        <th>Dark</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary font-mono text-ios-footnote text-secondary">
                    {[
                        ["--glass-surface", "rgba(255,255,255,.72)", "rgba(28,28,30,.60)"],
                        ["--glass-surface-strong", "rgba(255,255,255,.90)", "rgba(36,36,38,.88)"],
                        ["--glass-blur", "24px", "24px"],
                        ["--glass-saturation", "180%", "180%"],
                        ["--glass-border (inner rim)", "rgba(255,255,255,.60)", "rgba(255,255,255,.10)"],
                        ["--glass-shadow", "0 8px 32px rgba(0,0,0,.12)", "0 16px 40px rgba(0,0,0,.45)"],
                        ["--scrim (behind sheets/alerts)", "rgba(0,0,0,.32)", "rgba(0,0,0,.55)"],
                    ].map(([n, l, d]) => (
                        <tr key={n}>
                            <td className="py-2.5 text-primary">{n}</td>
                            <td>{l}</td>
                            <td>{d}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ),
};
