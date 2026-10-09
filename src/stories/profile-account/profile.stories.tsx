import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScreenChromeContext } from "@/components/device/screen";
import { TabBar } from "@/components/navigation/tab-bar";
import { CRANE_TABS } from "@/components/prototype/app-shell";
import { StackNavigator } from "@/components/prototype/stack-navigator";
import { ProfileScreen, profileScreens } from "@/screens/profile";

const meta: Meta = {
    title: "Profile ∕ Account/Profile",
    parameters: {
        phone: true,
        docs: {
            description: {
                component:
                    "Recreates **IMG_2170 / IMG_2171** (Profile root) and **IMG_2191** (Delete Account alert). Every row pushes its sub-screen; Delete Account opens the glass alert.",
            },
        },
    },
};
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => <StackNavigator screens={profileScreens} initialRoute="profile" /> };

export const WithTabBar: Story = {
    name: "With tab bar",
    render: () => (
        <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
            <StackNavigator screens={profileScreens} initialRoute="profile" />
            <TabBar items={CRANE_TABS.map((t) => ({ ...t, badge: t.id === "profile" ? 1 : undefined }))} activeId="profile" onChange={() => {}} />
        </ScreenChromeContext.Provider>
    ),
};

export const DeleteAccountAlert: Story = {
    name: "Delete Account alert",
    render: () => (
        <ScreenChromeContext.Provider value={{ hasTabBar: true }}>
            <ProfileScreen defaultDeleteOpen />
            <TabBar items={CRANE_TABS} activeId="profile" onChange={() => {}} />
        </ScreenChromeContext.Provider>
    ),
};
