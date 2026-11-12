import type { Meta, StoryObj } from "@storybook/react-vite";
import { WebFrame } from "@/components/web/web-frame";
import { PageHeader, WebPage } from "@/components/web/web-layout";
import { CartProvider, linesFrom } from "@/screens/web/cart-store";
import { WebSessionProvider, WebShell } from "@/screens/web/web-shell";

/** Crane Web chrome: header (utility row + course switcher + section nav), course picker and footer. */
const meta: Meta = {
    title: "Crane Web/Components/Header & Footer",
    parameters: { layout: "fullscreen" },
};
export default meta;

const Page = ({ signedIn = true }: { signedIn?: boolean }) => (
    <WebSessionProvider signedIn={signedIn}>
        <CartProvider initial={linesFrom([])}>
            <WebShell active="shop">
                <WebPage>
                    <PageHeader title="Shop" subtitle="Page content goes here." />
                    <div className="mt-8 h-[420px] rounded-xl bg-primary ring-1 ring-secondary ring-inset" />
                </WebPage>
            </WebShell>
        </CartProvider>
    </WebSessionProvider>
);

export const Desktop: StoryObj = { render: () => <div className="p-6"><WebFrame><Page /></WebFrame></div> };
export const Guest: StoryObj = { render: () => <div className="p-6"><WebFrame><Page signedIn={false} /></WebFrame></div> };
export const Laptop: StoryObj = { render: () => <div className="p-6"><WebFrame width="laptop"><Page /></WebFrame></div> };
export const MobileWeb: StoryObj = { name: "Mobile web", render: () => <div className="p-6"><WebFrame width="mobile"><Page /></WebFrame></div> };
