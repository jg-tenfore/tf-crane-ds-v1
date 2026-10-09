import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Screen } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { NavigationBar } from "@/components/navigation/navigation-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";

const meta: Meta<typeof TabBar> = {
    title: "Components/Navigation/Tab Bar",
    component: TabBar,
    parameters: { phone: true },
};
export default meta;

const Demo = ({ initial = "home", badge }: { initial?: string; badge?: number }) => {
    const [tab, setTab] = useState(initial);
    const items = CRANE_TABS.map((t) => ({ ...t, badge: t.id === "profile" ? badge : undefined }));
    return (
        <>
            <Screen nav={<NavigationBar title={items.find((i) => i.id === tab)?.label} />}>
                <div className="space-y-3 px-gutter pt-4">
                    {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="h-24 rounded-ios-card bg-primary shadow-ios-card" />
                    ))}
                </div>
            </Screen>
            <TabBar items={items} activeId={tab} onChange={setTab} />
        </>
    );
};

export const Default: StoryObj = { render: () => <Demo /> };
export const WithBadge: StoryObj = { name: "With badge", render: () => <Demo initial="profile" badge={1} /> };
